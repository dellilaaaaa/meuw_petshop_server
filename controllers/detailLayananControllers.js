
const mongoose = require("mongoose");
const DetailLayanan = require("../models/DetailLayanan");
const Transaksi = require("../models/Transaksi");
const Layanan = require("../models/Layanan");

// Fungsi validasi detail layanan
const validateDetailLayanan = async (
  id_transaksi,
  id_layanan,
  jumlah,
  harga_satuan
) => {
  if (
    !id_transaksi ||
    !id_layanan ||
    jumlah === undefined ||
    harga_satuan === undefined
  ) {
    throw new Error(
      "ID transaksi, ID layanan, jumlah, dan harga satuan harus diisi"
    );
  }

  const transaksi = await Transaksi.findOne({ id_transaksi });

  if (!transaksi) {
    throw new Error("Transaksi tidak ditemukan");
  }

  const layanan = await Layanan.findOne({ id_layanan });

  if (!layanan) {
    throw new Error("Layanan tidak ditemukan");
  }

  const jumlahAngka = Number(jumlah);
  const hargaAngka = Number(harga_satuan);

  if (!Number.isInteger(jumlahAngka) || jumlahAngka < 1) {
    throw new Error(
      "Jumlah layanan minimal 1 dan harus berupa bilangan bulat"
    );
  }

  if (
    !Number.isFinite(hargaAngka) ||
    hargaAngka < 0 ||
    hargaAngka > 9999999999.99
  ) {
    throw new Error("Harga satuan tidak valid");
  }

  return { jumlahAngka, hargaAngka };
};

// Fungsi membuat ID Detail Layanan Auto Increment
const generateDetailLayananId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "detail_layanan" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID detail layanan sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 1. Tampilkan Semua Detail Layanan
exports.getAllDetailLayanan = async (req, res) => {
  try {
    const detail = await DetailLayanan.find().sort({
      id_detail_layanan: 1
    });

    res.status(200).json({
      success: true,
      total: detail.length,
      data: detail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data detail layanan",
      error: error.message
    });
  }
};

// 2. Tampilkan Detail Layanan Berdasarkan ID
exports.getDetailLayananById = async (req, res) => {
  try {
    const detail = await DetailLayanan.findOne({
      id_detail_layanan: req.params.id
    });

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Detail layanan tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Tampilkan Detail Berdasarkan Transaksi
exports.getDetailByTransaksi = async (req, res) => {
  try {
    const { id_transaksi } = req.params;

    const detail = await DetailLayanan.find({
      id_transaksi
    });

    res.status(200).json({
      success: true,
      total: detail.length,
      data: detail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail layanan transaksi",
      error: error.message
    });
  }
};

// 4. Tambah Detail Layanan
exports.createDetailLayanan = async (req, res) => {
  try {
    const {
      id_transaksi,
      id_layanan,
      jumlah,
      harga_satuan
    } = req.body;

    const { jumlahAngka, hargaAngka } =
      await validateDetailLayanan(
        id_transaksi,
        id_layanan,
        jumlah,
        harga_satuan
      );

    const id_detail_layanan = await generateDetailLayananId();

    const detailBaru = await DetailLayanan.create({
      id_detail_layanan,
      id_transaksi,
      id_layanan,
      jumlah: jumlahAngka,
      harga_satuan: hargaAngka
    });

    res.status(201).json({
      success: true,
      message: "Detail layanan berhasil ditambahkan",
      data: detailBaru
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal menambahkan detail layanan",
      error: error.message
    });
  }
};
