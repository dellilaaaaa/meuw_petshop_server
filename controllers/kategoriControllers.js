
const mongoose = require("mongoose");
const Kategori = require("../models/Kategori");
const Catalog = require("../models/Catalog");

// 1. Tambah Kategori
exports.createKategori = async (req, res) => {
  try {
    const { nama_kategori } = req.body;

    if (!nama_kategori || !nama_kategori.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori harus diisi"
      });
    }

    if (nama_kategori.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori maksimal 50 karakter"
      });
    }

    // Auto Increment ID Kategori
    const counters = mongoose.connection.collection("counters");

    const counter = await counters.findOneAndUpdate(
      { _id: "kategori" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    if (counter.seq > 9999) {
      return res.status(400).json({
        success: false,
        message: "ID kategori sudah mencapai batas maksimal"
      });
    }

    const kategoriBaru = await Kategori.create({
      id_kategori: String(counter.seq),
      nama_kategori: nama_kategori.trim()
    });

    res.status(201).json({
      success: true,
      message: "Kategori barang berhasil ditambahkan!",
      data: kategoriBaru
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Tampilkan Semua Kategori
exports.getAllKategori = async (req, res) => {
  try {
    const kategoriList = await Kategori.find();

    res.status(200).json({
      success: true,
      total: kategoriList.length,
      data: kategoriList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Tampilkan Kategori Berdasarkan ID
exports.getKategoriById = async (req, res) => {
  try {
    const kategori = await Kategori.findOne({
      id_kategori: req.params.id
    });

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: kategori
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Update Kategori
exports.updateKategori = async (req, res) => {
  try {
    const { nama_kategori } = req.body;

    if (!nama_kategori || !nama_kategori.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori harus diisi"
      });
    }

    if (nama_kategori.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori maksimal 50 karakter"
      });
    }

    const kategori = await Kategori.findOneAndUpdate(
      { id_kategori: req.params.id },
      { nama_kategori: nama_kategori.trim() },
      { new: true, runValidators: true }
    );

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui!",
      data: kategori
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 5. Hapus Kategori
exports.deleteKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findOne({
      id_kategori: req.params.id
    });

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan"
      });
    }

    // Cek apakah kategori masih digunakan oleh barang
    const barang = await Catalog.findOne({
      id_kategori: req.params.id
    });

    if (barang) {
      return res.status(400).json({
        success: false,
        message: "Kategori tidak dapat dihapus karena masih digunakan oleh barang"
      });
    }

    await Kategori.deleteOne({
      id_kategori: req.params.id
    });

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
