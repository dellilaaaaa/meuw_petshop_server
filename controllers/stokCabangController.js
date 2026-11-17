
const mongoose = require("mongoose");
const StokCabang = require("../models/StokCabang");
const Store = require("../models/Store");
const Catalog = require("../models/Catalog");

// Fungsi validasi data stok
const validateStok = async (id_toko, id_barang, jumlah_stok) => {
  if (!id_toko || !id_barang || jumlah_stok === undefined || jumlah_stok === null) {
    throw new Error("ID toko, ID barang, dan jumlah stok harus diisi");
  }

  const jumlah = Number(jumlah_stok);

  if (!Number.isInteger(jumlah) || jumlah < 0) {
    throw new Error("Jumlah stok harus berupa bilangan bulat dan tidak boleh negatif");
  }

  const toko = await Store.findOne({ id_toko });

  if (!toko) {
    throw new Error("Toko tidak ditemukan");
  }

  const barang = await Catalog.findOne({ id_barang });

  if (!barang) {
    throw new Error("Barang tidak ditemukan");
  }

  return jumlah;
};

// Fungsi membuat ID Stok Auto Increment
const generateStokId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "stok_cabang" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID stok sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 1. Tampilkan Semua Stok Cabang
exports.getAllStokCabang = async (req, res) => {
  try {
    const data = await StokCabang.find().sort({ id_stok: 1 });

    res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Tampilkan Stok Berdasarkan ID
exports.getStokCabangById = async (req, res) => {
  try {
    const data = await StokCabang.findOne({
      id_stok: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data stok cabang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Tampilkan Stok Berdasarkan Toko
exports.getStokByToko = async (req, res) => {
  try {
    const data = await StokCabang.find({
      id_toko: req.params.id_toko
    });

    res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Tampilkan Stok Berdasarkan Barang
exports.getStokByBarang = async (req, res) => {
  try {
    const data = await StokCabang.find({
      id_barang: req.params.id_barang
    });

    res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 5. Tambah Stok Cabang
exports.createStokCabang = async (req, res) => {
  try {
    const { id_toko, id_barang, jumlah_stok } = req.body;

    const jumlah = await validateStok(
      id_toko,
      id_barang,
      jumlah_stok
    );

    // Cek apakah barang sudah terdaftar di toko tersebut
    const stokSudahAda = await StokCabang.findOne({
      id_toko,
      id_barang
    });

    if (stokSudahAda) {
      return res.status(400).json({
        success: false,
        message: "Stok barang untuk toko tersebut sudah tersedia. Silakan perbarui jumlah stok."
      });
    }

    const id_stok = await generateStokId();

    const data = await StokCabang.create({
      id_stok,
      id_toko,
      id_barang,
      jumlah_stok: jumlah
    });

    res.status(201).json({
      success: true,
      message: "Stok cabang berhasil ditambahkan",
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 6. Update Stok Cabang
exports.updateStokCabang = async (req, res) => {
  try {
    const { id_toko, id_barang, jumlah_stok } = req.body;

    const jumlah = await validateStok(
      id_toko,
      id_barang,
      jumlah_stok
    );

    const stok = await StokCabang.findOne({
      id_stok: req.params.id
    });

    if (!stok) {
      return res.status(404).json({
        success: false,
        message: "Data stok cabang tidak ditemukan"
      });
    }

    // Cek duplikasi kombinasi toko dan barang
    const stokDuplikat = await StokCabang.findOne({
      id_toko,
      id_barang,
      id_stok: { $ne: req.params.id }
    });

    if (stokDuplikat) {
      return res.status(400).json({
        success: false,
        message: "Stok barang untuk toko tersebut sudah tersedia"
      });
    }

    stok.id_toko = id_toko;
    stok.id_barang = id_barang;
    stok.jumlah_stok = jumlah;

    await stok.save();

    res.status(200).json({
      success: true,
      message: "Stok cabang berhasil diperbarui",
      data: stok
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 7. Hapus Stok Cabang
exports.deleteStokCabang = async (req, res) => {
  try {
    const data = await StokCabang.findOneAndDelete({
      id_stok: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data stok cabang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Stok cabang berhasil dihapus",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
