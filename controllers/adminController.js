const mongoose = require("mongoose");
const Transaksi = require("../models/Transaksi");
const DetailTransaksi = require("../models/DetailTransaksi");
const DetailLayanan = require("../models/DetailLayanan");
const BookingLayanan = require("../models/BookingLayanan");
const HistoriTransaksi = require("../models/HistoriTransaksi");
const Catalog = require("../models/Catalog");
const Layanan = require("../models/Layanan");
const User = require("../models/User");

// 1. GET /api/admin/laporan?startDate=2026-11-01&endDate=2026-11-30&jenis=semua
exports.getLaporan = async (req, res) => {
  try {
    const { startDate, endDate, jenis = "semua", status } = req.query;

    // Filter tanggal transaksi
    const filterTransaksi = {};
    if (startDate || endDate) {
      filterTransaksi.tanggal = {};
      if (startDate) filterTransaksi.tanggal.$gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) filterTransaksi.tanggal.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
    if (status && status !== "semua") {
      filterTransaksi.status = status;
    }

    // Ambil semua data master untuk lookup cepat berdasarkan custom ID
    const [transaksis, detailBarangs, detailLayanans, bookings, catalogs, layanans, users] =
      await Promise.all([
        Transaksi.find(filterTransaksi).sort({ tanggal: -1 }).lean(),
        DetailTransaksi.find().lean(),
        DetailLayanan.find().lean(),
        BookingLayanan.find().lean(),
        Catalog.find().lean(),
        Layanan.find().lean(),
        User.find().select("-password").lean()
      ]);

    const mapUser = Object.fromEntries(users.map((u) => [u.id_user, u]));
    const mapCatalog = Object.fromEntries(catalogs.map((c) => [c.id_barang, c]));
    const mapLayanan = Object.fromEntries(layanans.map((l) => [l.id_layanan, l]));
    const mapBooking = Object.fromEntries(bookings.map((b) => [b.id_detail_layanan, b]));

    const records = [];
    const itemCounter = {};
    let totalPendapatan = 0;
    let totalItemTerjual = 0;

    for (const trx of transaksis) {
      const pelanggan = mapUser[trx.id_user] || { nama: "Pelanggan Umum", username: "-" };
      const isValidRevenue = trx.status === "Selesai" || trx.status === "Diproses";

      // Rincian Produk di transaksi ini
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

      // Rincian Layanan di transaksi ini
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

    // Cari item terlaris
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. PUT /api/admin/transaksi/:id_transaksi/status
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
    transaksi.status = status;
    await transaksi.save();

    // Catat otomatis ke HistoriTransaksi
    const counters = mongoose.connection.collection("counters");
    const counter = await counters.findOneAndUpdate(
      { _id: "histori_transaksi" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    await HistoriTransaksi.create({
      id_histori: String(counter.seq).slice(-4),
      id_transaksi: transaksi.id_transaksi,
      status_sebelumnya: statusSebelumnya,
      status_terbaru: status,
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

// 3. PUT /api/admin/booking/:id_booking/status
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