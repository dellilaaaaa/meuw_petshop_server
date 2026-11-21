const mongoose = require("mongoose");
const Transaksi = require("../models/Transaksi");
const DetailTransaksi = require("../models/DetailTransaksi");
const StokCabang = require("../models/StokCabang");
const HistoriTransaksi = require("../models/HistoriTransaksi");
const User = require("../models/User");
const Store = require("../models/Store");

const daftarStatus = ["Pending", "Diproses", "Selesai", "Dibatalkan"];

// Generate ID Auto Increment (maksimal 4 digit sesuai schema)
const generateId = async (namaCounter) => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: namaCounter },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// Validasi data transaksi
const validateTransaksi = async (data) => {
  const { id_user, id_toko, total_harga } = data;

  if (!id_user || !id_toko || total_harga === undefined) {
    throw new Error("ID user, ID toko, dan total harga harus diisi");
  }

  const user = await User.findOne({ id_user: String(id_user) });
  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const toko = await Store.findOne({ id_toko: String(id_toko) });
  if (!toko) {
    throw new Error("Toko tidak ditemukan");
  }

  const harga = Number(total_harga);
  if (!Number.isFinite(harga) || harga < 0 || harga > 9999999999.99) {
    throw new Error("Total harga tidak valid");
  }

  return {
    id_user: String(id_user),
    id_toko: String(id_toko),
    total_harga: harga,
  };
};

// Mencatat histori transaksi
const createHistori = async (
  id_transaksi,
  status_sebelumnya,
  status_terbaru,
  catatan
) => {
  const id_histori = await generateId("histori_transaksi");

  return await HistoriTransaksi.create({
    id_histori,
    id_transaksi: String(id_transaksi),
    status_sebelumnya,
    status_terbaru,
    tanggal_perubahan: new Date(),
    catatan,
  });
};

// Kembalikan stok cabang jika transaksi dibatalkan
const restoreStokCabang = async (id_transaksi, id_toko) => {
  const items = await DetailTransaksi.find({ id_transaksi: String(id_transaksi) });
  for (const item of items) {
    await StokCabang.findOneAndUpdate(
      { id_toko: String(id_toko), id_barang: String(item.id_barang) },
      { $inc: { jumlah_stok: item.jumlah } }
    );
  }
};

// 1. Tampilkan Semua Transaksi (bisa difilter ?id_user=... untuk riwayat customer)
exports.getAllTransaksi = async (req, res) => {
  try {
    const filter = {};
    if (req.query.id_user) {
      filter.id_user = String(req.query.id_user);
    }

    const transaksi = await Transaksi.find(filter).sort({ tanggal: -1 });

    res.status(200).json({
      success: true,
      total: transaksi.length,
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data transaksi",
      error: error.message,
    });
  }
};

// 2. Tampilkan Transaksi Berdasarkan ID
exports.getTransaksiById = async (req, res) => {
  try {
    const transaksi = await Transaksi.findOne({
      id_transaksi: req.params.id_transaksi,
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail transaksi",
      error: error.message,
    });
  }
};

// 3. Tambah Transaksi Baru
exports.createTransaksi = async (req, res) => {
  try {
    const dataValid = await validateTransaksi(req.body);
    const metodePembayaran = req.body.metode_pembayaran || "QRIS";
    const metodePengiriman = req.body.metode_pengiriman || "Kurir Instan";

    // Jika QRIS Instan disimulasikan langsung lunas, status awal langsung "Diproses"
    const statusAwal =
      req.body.status && daftarStatus.includes(req.body.status)
        ? req.body.status
        : "Pending";

    const id_transaksi = await generateId("transaksi");

    const transaksiBaru = await Transaksi.create({
      id_transaksi,
      ...dataValid,
      status: statusAwal,
    });

    const catatanAwal =
      statusAwal === "Diproses"
        ? `Pembayaran via ${metodePembayaran} terverifikasi otomatis (${metodePengiriman})`
        : `Pesanan dibuat — Metode: ${metodePembayaran} (${metodePengiriman}). Menunggu pembayaran/konfirmasi.`;

    await createHistori(id_transaksi, null, statusAwal, catatanAwal);

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat dan histori awal dicatat",
      data: transaksiBaru,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal membuat transaksi",
      error: error.message,
    });
  }
};

// 4. Update Status Transaksi (bisa dipakai Customer untuk Batalkan/Terima Pesanan maupun Admin)
exports.updateStatusTransaksi = async (req, res) => {
  try {
    const statusBaru = req.body.status_terbaru || req.body.status;
    const { catatan } = req.body;

    if (!daftarStatus.includes(statusBaru)) {
      return res.status(400).json({
        success: false,
        message: "Status transaksi tidak valid",
      });
    }

    const transaksi = await Transaksi.findOne({
      id_transaksi: req.params.id_transaksi,
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    const statusSebelumnya = transaksi.status;
    if (statusSebelumnya === statusBaru) {
      return res.status(200).json({
        success: true,
        message: "Status transaksi tidak berubah",
        data: transaksi,
      });
    }

    // Jika dibatalkan dari status aktif, kembalikan stok ke cabang toko asal
    if (statusBaru === "Dibatalkan" && statusSebelumnya !== "Dibatalkan") {
      await restoreStokCabang(transaksi.id_transaksi, transaksi.id_toko);
    }

    transaksi.status = statusBaru;
    await transaksi.save();

    await createHistori(
      transaksi.id_transaksi,
      statusSebelumnya,
      statusBaru,
      catatan || `Status diubah dari ${statusSebelumnya} menjadi ${statusBaru}`
    );

    res.status(200).json({
      success: true,
      message: "Status transaksi berhasil diperbarui dan histori dicatat",
      data: transaksi,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal memperbarui status transaksi",
      error: error.message,
    });
  }
};