
const mongoose = require("mongoose");
const Layanan = require("../models/Layanan");

// Fungsi validasi data layanan
const validateLayanan = (data) => {
  const { nama_layanan, harga, deskripsi, foto } = data;

  if (!nama_layanan || !nama_layanan.trim()) {
    throw new Error("Nama layanan harus diisi");
  }

  if (nama_layanan.trim().length > 50) {
    throw new Error("Nama layanan maksimal 50 karakter");
  }

  if (harga === undefined || harga === null || harga === "") {
    throw new Error("Harga layanan harus diisi");
  }

  const hargaAngka = Number(harga);

  if (
    !Number.isFinite(hargaAngka) ||
    hargaAngka < 0 ||
    hargaAngka > 9999999999.99
  ) {
    throw new Error("Harga layanan tidak valid");
  }

  if (!deskripsi || !deskripsi.trim()) {
    throw new Error("Deskripsi layanan harus diisi");
  }

  if (foto && foto.length > 255) {
    throw new Error("Path foto maksimal 255 karakter");
  }

  return {
    nama_layanan: nama_layanan.trim(),
    harga: hargaAngka,
    foto: foto || "",
    deskripsi: deskripsi.trim()
  };
};

// Fungsi membuat ID Layanan Auto Increment
const generateLayananId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "layanan" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID layanan sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 1. Tampilkan Semua Layanan
exports.getAllLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.find().sort({ id_layanan: 1 });

    res.status(200).json({
      success: true,
      total: layanan.length,
      data: layanan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data layanan",
      error: error.message
    });
  }
};

// 2. Tampilkan Layanan Berdasarkan ID
exports.getLayananById = async (req, res) => {
  try {
    const layanan = await Layanan.findOne({
      id_layanan: req.params.id
    });

    if (!layanan) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: layanan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data layanan",
      error: error.message
    });
  }
};

// 3. Tambah Satu atau Beberapa Layanan
exports.createLayanan = async (req, res) => {
  try {
    const data = req.body;
    const dataLayanan = Array.isArray(data) ? data : [data];

    if (dataLayanan.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data layanan tidak boleh kosong"
      });
    }

    const layananBaru = [];

    for (const item of dataLayanan) {
      const dataValid = validateLayanan(item);
      const id_layanan = await generateLayananId();

      const layanan = await Layanan.create({
        id_layanan,
        ...dataValid
      });

      layananBaru.push(layanan);
    }

    res.status(201).json({
      success: true,
      message: "Layanan berhasil ditambahkan",
      jumlah: layananBaru.length,
      data: Array.isArray(data) ? layananBaru : layananBaru[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal menambahkan layanan",
      error: error.message
    });
  }
};

// 4. Update Layanan
exports.updateLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.findOne({
      id_layanan: req.params.id
    });

    if (!layanan) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan"
      });
    }

    const dataValid = validateLayanan({
      nama_layanan: req.body.nama_layanan,
      harga: req.body.harga,
      deskripsi: req.body.deskripsi,
      foto: req.body.foto !== undefined
        ? req.body.foto
        : layanan.foto
    });

    layanan.nama_layanan = dataValid.nama_layanan;
    layanan.harga = dataValid.harga;
    layanan.deskripsi = dataValid.deskripsi;
    layanan.foto = dataValid.foto;

    await layanan.save();

    res.status(200).json({
      success: true,
      message: "Layanan berhasil diperbarui",
      data: layanan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal memperbarui layanan",
      error: error.message
    });
  }
};

// 5. Hapus Layanan
exports.deleteLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.findOneAndDelete({
      id_layanan: req.params.id
    });

    if (!layanan) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Layanan berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus layanan",
      error: error.message
    });
  }
};
