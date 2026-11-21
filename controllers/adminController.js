const mongoose = require("mongoose");
const Transaksi = require("../models/Transaksi");
const DetailTransaksi = require("../models/DetailTransaksi");
const DetailLayanan = require("../models/DetailLayanan");
const BookingLayanan = require("../models/BookingLayanan");
const HistoriTransaksi = require("../models/HistoriTransaksi");
const Catalog = require("../models/Catalog");
const Layanan = require("../models/Layanan");
const User = require("../models/User");
const Store = require("../models/Store");
const StokCabang = require("../models/StokCabang");

// Helper pembuat ID unik maksimal 4 karakter (sesuai maxlength: 4 di schema)
async function getNextShortId(counterName, Model, fieldName) {
  const counters = mongoose.connection.collection("counters");
  let candidate = "";
  for (let i = 0; i < 15; i++) {
    const res = await counters.findOneAndUpdate(
      { _id: counterName },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    candidate = String(res.seq).slice(-4);
    const exists = await Model.exists({ [fieldName]: candidate });
    if (!exists) return candidate;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ==========================================
// 1. LAPORAN & STATUS TRANSAKSI / BOOKING
// ==========================================

// GET /api/admin/laporan
exports.getLaporan = async (req, res) => {
  try {
    const { startDate, endDate, jenis = "semua", status, id_toko } = req.query;

    const filterTransaksi = {};
    if (startDate || endDate) {
      filterTransaksi.tanggal = {};
      if (startDate) filterTransaksi.tanggal.$gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) filterTransaksi.tanggal.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
    if (status && status !== "semua") {
      filterTransaksi.status = status;
    }
    if (id_toko && id_toko !== "semua") {
      filterTransaksi.id_toko = String(id_toko);
    }

    const [transaksis, detailBarangs, detailLayanans, bookings, catalogs, layanans, users, stores] =
      await Promise.all([
        Transaksi.find(filterTransaksi).sort({ tanggal: -1 }).lean(),
        DetailTransaksi.find().lean(),
        DetailLayanan.find().lean(),
        BookingLayanan.find().lean(),
        Catalog.find().lean(),
        Layanan.find().lean(),
        User.find().select("-password").lean(),
        Store.find().lean()
      ]);

    const mapUser = Object.fromEntries(users.map((u) => [u.id_user, u]));
    const mapCatalog = Object.fromEntries(catalogs.map((c) => [c.id_barang, c]));
    const mapLayanan = Object.fromEntries(layanans.map((l) => [l.id_layanan, l]));
    const mapBooking = Object.fromEntries(bookings.map((b) => [b.id_detail_layanan, b]));
    const mapStore = Object.fromEntries(stores.map((s) => [String(s.id_toko), s]));

    const records = [];
    const itemCounter = {};
    let totalPendapatan = 0;
    let totalItemTerjual = 0;

    for (const trx of transaksis) {
      const pelanggan = mapUser[trx.id_user] || { nama: "Pelanggan Umum", username: "-" };
      const toko = mapStore[String(trx.id_toko)] || {
        id_toko: String(trx.id_toko || "1"),
        nama_toko: "MeLuw Petshop - Jakarta Pusat"
      };
      const isValidRevenue = trx.status === "Selesai" || trx.status === "Diproses";

      if (jenis === "semua" || jenis === "produk") {
        const items = detailBarangs.filter((d) => d.id_transaksi === trx.id_transaksi);
        for (const item of items) {
          const barang = mapCatalog[item.id_barang];
          const namaItem = barang ? barang.nama_barang : `Barang #${item.id_barang}`;
          const subtotal = item.jumlah * item.harga_satuan;

          if (isValidRevenue) {
            totalPendapatan += subtotal;
            totalItemTerjual += item.jumlah;
            itemCounter[namaItem] = (itemCounter[namaItem] || 0) + item.jumlah;
          }

          records.push({
            id_referensi: item.id_detail_transaksi,
            id_transaksi: trx.id_transaksi,
            id_toko: toko.id_toko,
            nama_toko: toko.nama_toko,
            tanggal: trx.tanggal,
            nama_pelanggan: pelanggan.nama,
            kategori_laporan: "Produk",
            nama_item: namaItem,
            jumlah: item.jumlah,
            harga_satuan: item.harga_satuan,
            subtotal,
            status: trx.status,
            jadwal_booking: null
          });
        }
      }

      if (jenis === "semua" || jenis === "layanan") {
        const services = detailLayanans.filter((d) => d.id_transaksi === trx.id_transaksi);
        for (const srv of services) {
          const layanan = mapLayanan[srv.id_layanan];
          const booking = mapBooking[srv.id_detail_layanan];
          const namaItem = layanan ? layanan.nama_layanan : `Layanan #${srv.id_layanan}`;
          const subtotal = srv.jumlah * srv.harga_satuan;

          if (isValidRevenue) {
            totalPendapatan += subtotal;
            totalItemTerjual += srv.jumlah;
            itemCounter[namaItem] = (itemCounter[namaItem] || 0) + srv.jumlah;
          }

          records.push({
            id_referensi: booking ? booking.id_booking : srv.id_detail_layanan,
            id_transaksi: trx.id_transaksi,
            id_toko: toko.id_toko,
            nama_toko: toko.nama_toko,
            tanggal: trx.tanggal,
            nama_pelanggan: pelanggan.nama,
            kategori_laporan: "Layanan",
            nama_item: namaItem,
            jumlah: srv.jumlah,
            harga_satuan: srv.harga_satuan,
            subtotal,
            status: booking ? booking.status_booking : trx.status,
            jadwal_booking: booking
              ? {
                  id_booking: booking.id_booking,
                  tanggal_mulai: booking.tanggal_mulai,
                  jam_mulai: booking.jam_mulai,
                  tanggal_selesai: booking.tanggal_selesai
                }
              : null
          });
        }
      }
    }

    let itemTerlaris = "-";
    let maxQty = 0;
    for (const [nama, qty] of Object.entries(itemCounter)) {
      if (qty > maxQty) {
        maxQty = qty;
        itemTerlaris = `${nama} (${qty}x)`;
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        total_pendapatan: totalPendapatan,
        total_transaksi: transaksis.length,
        total_item_terjual: totalItemTerjual,
        total_booking: bookings.length,
        total_produk: catalogs.length,
        total_pelanggan: users.filter((u) => u.role !== "admin").length,
        item_terlaris: itemTerlaris
      },
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/transaksi/:id_transaksi/status
exports.updateStatusTransaksi = async (req, res) => {
  try {
    const { status, catatan = "" } = req.body;
    const validStatus = ["Pending", "Diproses", "Selesai", "Dibatalkan"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilih: ${validStatus.join(", ")}`
      });
    }

    const transaksi = await Transaksi.findOne({ id_transaksi: req.params.id_transaksi });
    if (!transaksi) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    const statusSebelumnya = transaksi.status;
    if (statusSebelumnya === status) {
      return res.status(200).json({
        success: true,
        message: "Status transaksi tidak berubah",
        data: transaksi
      });
    }

    // Jika Admin membatalkan transaksi yang belum dibatalkan, kembalikan stok ke cabang toko asal
    if (status === "Dibatalkan" && statusSebelumnya !== "Dibatalkan") {
      const detailItems = await DetailTransaksi.find({ id_transaksi: transaksi.id_transaksi });
      for (const item of detailItems) {
        await StokCabang.findOneAndUpdate(
          { id_toko: String(transaksi.id_toko), id_barang: String(item.id_barang) },
          { $inc: { jumlah_stok: item.jumlah } }
        );
      }
    }

    transaksi.status = status;
    await transaksi.save();

    const idHistori = await getNextShortId("histori_transaksi", HistoriTransaksi, "id_histori");
    await HistoriTransaksi.create({
      id_histori: idHistori,
      id_transaksi: transaksi.id_transaksi,
      status_sebelumnya: statusSebelumnya,
      status_terbaru: status,
      tanggal_perubahan: new Date(),
      catatan: catatan || `Diubah oleh Admin menjadi ${status}`
    });

    res.status(200).json({
      success: true,
      message: `Status transaksi #${transaksi.id_transaksi} diperbarui menjadi ${status}`,
      data: transaksi
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/booking/:id_booking/status
exports.updateStatusBooking = async (req, res) => {
  try {
    const { status_booking } = req.body;
    if (!status_booking) {
      return res.status(400).json({ success: false, message: "status_booking wajib diisi" });
    }

    const booking = await BookingLayanan.findOneAndUpdate(
      { id_booking: req.params.id_booking },
      { status_booking },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: `Status booking #${booking.id_booking} diperbarui menjadi ${status_booking}`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. CRUD PRODUK & STOK CABANG
// ==========================================

// POST /api/admin/produk
exports.createProduk = async (req, res) => {
  try {
    const {
      nama_barang,
      harga,
      id_kategori = "1",
      foto = "",
      deskripsi = "",
      stok_awal = 10
    } = req.body;

    if (!nama_barang || harga === undefined) {
      return res.status(400).json({
        success: false,
        message: "Nama barang dan harga wajib diisi"
      });
    }

    const idBarang = await getNextShortId("catalog_id", Catalog, "id_barang");
    const newProduk = await Catalog.create({
      id_barang: idBarang,
      id_kategori: String(id_kategori || "1").slice(0, 4),
      nama_barang: nama_barang.trim(),
      harga: Number(harga),
      foto: foto.trim(),
      deskripsi: deskripsi.trim()
    });

    // Buat stok awal untuk ke-4 cabang toko (id_toko 1, 2, 3, 4)
    const jumlahStokInt = Math.max(0, parseInt(stok_awal, 10) || 0);
    const cabangIds = ["1", "2", "3", "4"];
    for (const idToko of cabangIds) {
      const idStok = await getNextShortId("stok_cabang_id", StokCabang, "id_stok");
      await StokCabang.create({
        id_stok: idStok,
        id_toko: idToko,
        id_barang: idBarang,
        jumlah_stok: jumlahStokInt
      });
    }

    res.status(201).json({
      success: true,
      message: "Produk & stok 4 cabang berhasil ditambahkan",
      data: newProduk
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/produk/:id_barang
exports.updateProduk = async (req, res) => {
  try {
    const { id_barang } = req.params;
    const { nama_barang, harga, id_kategori, foto, deskripsi, id_toko, jumlah_stok } = req.body;

    const updateFields = {};
    if (nama_barang !== undefined) updateFields.nama_barang = nama_barang.trim();
    if (harga !== undefined) updateFields.harga = Number(harga);
    if (id_kategori !== undefined) updateFields.id_kategori = String(id_kategori).slice(0, 4);
    if (foto !== undefined) updateFields.foto = foto.trim();
    if (deskripsi !== undefined) updateFields.deskripsi = deskripsi.trim();

    const updatedProduk = await Catalog.findOneAndUpdate(
      { id_barang: String(id_barang) },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedProduk) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    // Jika id_toko dan jumlah_stok dikirim, sekalian update stok cabang tersebut
    if (id_toko && jumlah_stok !== undefined) {
      const stokInt = Math.max(0, parseInt(jumlah_stok, 10) || 0);
      const existingStok = await StokCabang.findOne({
        id_toko: String(id_toko),
        id_barang: String(id_barang)
      });

      if (existingStok) {
        existingStok.jumlah_stok = stokInt;
        await existingStok.save();
      } else {
        const idStok = await getNextShortId("stok_cabang_id", StokCabang, "id_stok");
        await StokCabang.create({
          id_stok: idStok,
          id_toko: String(id_toko),
          id_barang: String(id_barang),
          jumlah_stok: stokInt
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Produk dan stok berhasil diperbarui",
      data: updatedProduk
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/produk/:id_barang
exports.deleteProduk = async (req, res) => {
  try {
    const { id_barang } = req.params;
    const deleted = await Catalog.findOneAndDelete({ id_barang: String(id_barang) });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    await StokCabang.deleteMany({ id_barang: String(id_barang) });

    res.status(200).json({
      success: true,
      message: `Produk #${id_barang} beserta stok cabangnya berhasil dihapus`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. CRUD LAYANAN PETSHOP
// ==========================================

// POST /api/admin/layanan
exports.createLayanan = async (req, res) => {
  try {
    const { nama_layanan, harga, deskripsi, foto = "" } = req.body;

    if (!nama_layanan || harga === undefined || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: "Nama layanan, harga, dan deskripsi wajib diisi"
      });
    }

    const idLayanan = await getNextShortId("layanan_id", Layanan, "id_layanan");
    const newLayanan = await Layanan.create({
      id_layanan: idLayanan,
      nama_layanan: nama_layanan.trim(),
      harga: Number(harga),
      deskripsi: deskripsi.trim(),
      foto: foto.trim()
    });

    res.status(201).json({
      success: true,
      message: "Layanan baru berhasil ditambahkan",
      data: newLayanan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/layanan/:id_layanan
exports.updateLayanan = async (req, res) => {
  try {
    const { id_layanan } = req.params;
    const { nama_layanan, harga, deskripsi, foto } = req.body;

    const updateFields = {};
    if (nama_layanan !== undefined) updateFields.nama_layanan = nama_layanan.trim();
    if (harga !== undefined) updateFields.harga = Number(harga);
    if (deskripsi !== undefined) updateFields.deskripsi = deskripsi.trim();
    if (foto !== undefined) updateFields.foto = foto.trim();

    const updated = await Layanan.findOneAndUpdate(
      { id_layanan: String(id_layanan) },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Layanan tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: "Layanan berhasil diperbarui",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/layanan/:id_layanan
exports.deleteLayanan = async (req, res) => {
  try {
    const { id_layanan } = req.params;
    const deleted = await Layanan.findOneAndDelete({ id_layanan: String(id_layanan) });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Layanan tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: `Layanan #${id_layanan} berhasil dihapus`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};