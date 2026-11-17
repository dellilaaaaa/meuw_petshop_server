
const mongoose = require("mongoose");
const Store = require("../models/Store");

// 1. Tampilkan Semua Toko
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ id_toko: 1 });

    res.status(200).json({
      success: true,
      total: stores.length,
      data: stores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Tampilkan Toko Berdasarkan ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findOne({
      id_toko: req.params.id
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Toko tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fungsi untuk membuat ID Toko Auto Increment
const generateStoreId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "toko" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID toko sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 3. Tambah Toko
exports.createStore = async (req, res) => {
  try {
    const data = req.body;
    const dataToko = Array.isArray(data) ? data : [data];

    if (dataToko.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data toko tidak boleh kosong"
      });
    }

    const stores = [];

    for (const item of dataToko) {
      if (
        !item.nama_toko ||
        !item.nama_toko.trim() ||
        !item.alamat ||
        !item.alamat.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Nama toko dan alamat harus diisi"
        });
      }

      const id_toko = await generateStoreId();

      const store = await Store.create({
        id_toko,
        nama_toko: item.nama_toko.trim(),
        alamat: item.alamat.trim()
      });

      stores.push(store);
    }

    res.status(201).json({
      success: true,
      message: "Toko berhasil ditambahkan",
      jumlah: stores.length,
      data: Array.isArray(data) ? stores : stores[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal menambahkan toko",
      error: error.message
    });
  }
};

// 4. Update Toko
exports.updateStore = async (req, res) => {
  try {
    const { nama_toko, alamat } = req.body;

    if (
      !nama_toko ||
      !nama_toko.trim() ||
      !alamat ||
      !alamat.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama toko dan alamat harus diisi"
      });
    }

    const store = await Store.findOneAndUpdate(
      { id_toko: req.params.id },
      {
        nama_toko: nama_toko.trim(),
        alamat: alamat.trim()
      },
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Toko tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Toko berhasil diperbarui",
      data: store
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 5. Hapus Toko
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({
      id_toko: req.params.id
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Toko tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Toko berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
