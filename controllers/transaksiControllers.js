
const mongoose = require("mongoose");
const Transaksi = require("../models/Transaksi");
const HistoriTransaksi = require("../models/HistoriTransaksi");
const User = require("../models/User");
const Store = require("../models/Store");

const daftarStatus = ["Pending", "Diproses", "Selesai", "Dibatalkan"];

// Generate ID Auto Increment
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

  const user = await User.findOne({ id_user });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const toko = await Store.findOne({ id_toko });

  if (!toko) {
    throw new Error("Toko tidak ditemukan");
  }

  const harga = Number(total_harga);

  if (
    !Number.isFinite(harga) ||
    harga < 0 ||
    harga > 9999999999.99
  ) {
    throw new Error("Total harga tidak valid");
  }

  return {
    id_user,
    id_toko,
    total_harga: harga
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
    id_transaksi,
    status_sebelumnya,
    status_terbaru,
    tanggal_perubahan: new Date(),
    catatan
  });
};

// 1. Tampilkan Semua Transaksi
exports.getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await Transaksi.find().sort({ tanggal: -1 });

    res.status(200).json({
      success: true,
      total: transaksi.length,
      data: transaksi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data transaksi",
      error: error.message
    });
  }
};

// 2. Tampilkan Transaksi Berdasarkan ID
exports.getTransaksiById = async (req, res) => {
  try {
    const transaksi = await Transaksi.findOne({
      id_transaksi: req.params.id_transaksi
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: transaksi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail transaksi",
      error: error.message
    });
  }
};

// 3. Tambah Transaksi
exports.createTransaksi = async (req, res) => {
  try {
    const dataValid = await validateTransaksi(req.body);

    const statusAwal = req.body.status || "Pending";

    if (!daftarStatus.includes(statusAwal)) {
      return res.status(400).json({
        success: false,
        message: "Status transaksi tidak valid"
      });
    }

    const id_transaksi = await generateId("transaksi");

    const transaksiBaru = await Transaksi.create({
      id_transaksi,
      ...dataValid,
      status: statusAwal
    });

    await createHistori(
      id_transaksi,
      null,
      statusAwal,
      "Transaksi berhasil dibuat"
    );

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat dan histori awal dicatat",
      data: transaksiBaru
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal membuat transaksi",
      error: error.message
    });
  }
};

// 4. Update Status Transaksi
exports.updateStatusTransaksi = async (req, res) => {
  try {
    const { status_terbaru, catatan } = req.body;

    if (!daftarStatus.includes(status_terbaru)) {
      return res.status(400).json({
        success: false,
        message: "Status transaksi tidak valid"
      });
    }

    const transaksi = await Transaksi.findOne({
      id_transaksi: req.params.id_transaksi
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    const statusSebelumnya = transaksi.status;

    transaksi.status = status_terbaru;
    await transaksi.save();

    await createHistori(
      transaksi.id_transaksi,
      statusSebelumnya,
      status_terbaru,
      catatan ||
        `Status diubah dari ${statusSebelumnya} menjadi ${status_terbaru}`
    );

    res.status(200).json({
      success: true,
      message: "Status transaksi berhasil diperbarui dan histori dicatat",
      data: transaksi
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal memperbarui status transaksi",
      error: error.message
    });
  }
};
