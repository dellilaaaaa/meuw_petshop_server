
const mongoose = require("mongoose");
const DetailTransaksi = require("../models/DetailTransaksi");
const Transaksi = require("../models/Transaksi");
const Catalog = require("../models/Catalog");

// Fungsi validasi detail transaksi
const validateDetailTransaksi = async (
  id_transaksi,
  id_barang,
  jumlah,
  harga_satuan
) => {
  if (!id_transaksi || !id_barang || jumlah === undefined || harga_satuan === undefined) {
    throw new Error("ID transaksi, ID barang, jumlah, dan harga satuan harus diisi");
  }

  const transaksi = await Transaksi.findOne({ id_transaksi });

  if (!transaksi) {
    throw new Error("Transaksi tidak ditemukan");
  }

  const barang = await Catalog.findOne({ id_barang });

  if (!barang) {
    throw new Error("Barang tidak ditemukan");
  }

  const jumlahAngka = Number(jumlah);
  const hargaAngka = Number(harga_satuan);

  if (!Number.isInteger(jumlahAngka) || jumlahAngka < 1) {
    throw new Error("Jumlah barang minimal 1 dan harus berupa bilangan bulat");
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

// Fungsi membuat ID Detail Transaksi Auto Increment
const generateDetailTransaksiId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "detail_transaksi" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID detail transaksi sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 1. Tampilkan Semua Detail Transaksi
exports.getAllDetailTransaksi = async (req, res) => {
  try {
    const detail = await DetailTransaksi.find().sort({
      id_detail_transaksi: 1
    });

    res.status(200).json({
      success: true,
      total: detail.length,
      data: detail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data detail transaksi",
      error: error.message
    });
  }
};

// 2. Tampilkan Detail Berdasarkan ID
exports.getDetailTransaksiById = async (req, res) => {
  try {
    const detail = await DetailTransaksi.findOne({
      id_detail_transaksi: req.params.id
    });

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Detail transaksi tidak ditemukan"
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

    const detail = await DetailTransaksi.find({
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
      message: "Gagal mengambil detail item transaksi",
      error: error.message
    });
  }
};

// 4. Tambah Detail Transaksi
exports.createDetailTransaksi = async (req, res) => {
  try {
    const {
      id_transaksi,
      id_barang,
      jumlah,
      harga_satuan
    } = req.body;

    const { jumlahAngka, hargaAngka } =
      await validateDetailTransaksi(
        id_transaksi,
        id_barang,
        jumlah,
        harga_satuan
      );

    const id_detail_transaksi = await generateDetailTransaksiId();

    const detailBaru = await DetailTransaksi.create({
      id_detail_transaksi,
      id_transaksi,
      id_barang,
      jumlah: jumlahAngka,
      harga_satuan: hargaAngka
    });

    res.status(201).json({
      success: true,
      message: "Detail barang transaksi berhasil ditambahkan",
      data: detailBaru
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal menambahkan detail barang transaksi",
      error: error.message
    });
  }
};
