
const mongoose = require("mongoose");
const HistoriTransaksi = require("../models/HistoriTransaksi");
const Transaksi = require("../models/Transaksi");

// Generate ID Histori Auto Increment
const generateHistoriId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "histori_transaksi" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID histori sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 1. Tampilkan Semua Histori
exports.getAllHistori = async (req, res) => {
  try {
    const histori = await HistoriTransaksi.find().sort({
      tanggal_perubahan: -1
    });

    res.status(200).json({
      success: true,
      total: histori.length,
      data: histori
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil seluruh data histori transaksi",
      error: error.message
    });
  }
};

// 2. Tampilkan Histori Berdasarkan Transaksi
exports.getHistoriByTransaksi = async (req, res) => {
  try {
    const { id_transaksi } = req.params;

    const histori = await HistoriTransaksi.find({
      id_transaksi
    }).sort({
      tanggal_perubahan: -1
    });

    res.status(200).json({
      success: true,
      total: histori.length,
      data: histori
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data histori transaksi",
      error: error.message
    });
  }
};

// 3. Tambah Histori
exports.addHistori = async (req, res) => {
  try {
    const {
      id_transaksi,
      status_sebelumnya,
      status_terbaru,
      catatan
    } = req.body;

    if (!id_transaksi || !status_terbaru) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi dan status terbaru harus diisi"
      });
    }

    // Cek apakah transaksi ada
    const transaksi = await Transaksi.findOne({
      id_transaksi
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    const daftarStatus = [
      "Pending",
      "Diproses",
      "Selesai",
      "Dibatalkan"
    ];

    if (!daftarStatus.includes(status_terbaru)) {
      return res.status(400).json({
        success: false,
        message: "Status terbaru tidak valid"
      });
    }

    if (
      status_sebelumnya !== undefined &&
      status_sebelumnya !== null &&
      !daftarStatus.includes(status_sebelumnya)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status sebelumnya tidak valid"
      });
    }

    const id_histori = await generateHistoriId();

    const historiBaru = await HistoriTransaksi.create({
      id_histori,
      id_transaksi,
      status_sebelumnya: status_sebelumnya ?? null,
      status_terbaru,
      catatan: catatan || ""
    });

    res.status(201).json({
      success: true,
      message: "Histori berhasil dicatat",
      data: historiBaru
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal mencatat histori",
      error: error.message
    });
  }
};
