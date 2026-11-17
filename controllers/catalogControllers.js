
const mongoose = require("mongoose");
const Catalog = require("../models/Catalog");
const Kategori = require("../models/Kategori");

// Mengubah lokasi foto menjadi URL yang bisa diakses frontend
const formatCatalog = (req, barang) => {
  const data = barang.toObject ? barang.toObject() : { ...barang };

  if (data.foto) {
    const foto = data.foto;

    // Jika sudah berupa URL, tidak perlu diubah
    if (/^https?:\/\//i.test(foto)) {
      return data;
    }

    const normalized = foto.replace(/\\/g, "/");
    const uploadIndex = normalized.toLowerCase().lastIndexOf("/uploads/");

    const fotoUrl = uploadIndex !== -1
      ? normalized.substring(uploadIndex)
      : `/uploads/barang/${normalized.split("/").pop()}`;

    data.foto = `${req.protocol}://${req.get("host")}${fotoUrl}`;
  }

  return data;
};

// Tambah Barang
exports.createCatalog = async (req, res) => {
  try {
    const { id_kategori, nama_barang, harga, deskripsi } = req.body;

    if (!id_kategori || !nama_barang || harga === undefined || harga === "") {
      return res.status(400).json({
        success: false,
        message: "Kategori, nama barang, dan harga wajib diisi"
      });
    }

    if (nama_barang.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Nama barang maksimal 50 karakter"
      });
    }

    const nilaiHarga = Number(harga);

    if (
      !Number.isFinite(nilaiHarga) ||
      nilaiHarga < 0 ||
      nilaiHarga > 9999999999.99
    ) {
      return res.status(400).json({
        success: false,
        message: "Harga tidak valid"
      });
    }

    // Cek Kategori
    const kategori = await Kategori.findOne({ id_kategori });

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Foto barang wajib diupload"
      });
    }

    // Auto Increment ID Barang
    const counters = mongoose.connection.collection("counters");

    const counter = await counters.findOneAndUpdate(
      { _id: "barang" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    if (counter.seq > 9999) {
      return res.status(400).json({
        success: false,
        message: "Batas ID Barang telah tercapai"
      });
    }

    const barangBaru = await Catalog.create({
      id_barang: String(counter.seq),
      id_kategori,
      nama_barang,
      harga: nilaiHarga,
      foto: `/uploads/barang/${req.file.filename}`,
      deskripsi: deskripsi || ""
    });

    res.status(201).json({
      success: true,
      message: "Barang berhasil ditambahkan",
      data: formatCatalog(req, barangBaru)
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ambil Semua Barang
exports.getAllCatalog = async (req, res) => {
  try {
    const catalogList = await Catalog.find();

    res.status(200).json({
      success: true,
      total: catalogList.length,
      data: catalogList.map(barang => formatCatalog(req, barang))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ambil Barang Berdasarkan ID
exports.getCatalogById = async (req, res) => {
  try {
    const barang = await Catalog.findOne({
      id_barang: req.params.id
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: formatCatalog(req, barang)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Edit Barang
exports.updateCatalog = async (req, res) => {
  try {
    const barang = await Catalog.findOne({
      id_barang: req.params.id
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan"
      });
    }

    const { id_kategori, nama_barang, harga, deskripsi } = req.body;

    if (id_kategori !== undefined) {
      const kategori = await Kategori.findOne({ id_kategori });

      if (!kategori) {
        return res.status(404).json({
          success: false,
          message: "Kategori tidak ditemukan"
        });
      }

      barang.id_kategori = id_kategori;
    }

    if (nama_barang !== undefined) {
      if (!nama_barang || nama_barang.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Nama barang wajib diisi dan maksimal 50 karakter"
        });
      }

      barang.nama_barang = nama_barang;
    }

    if (harga !== undefined) {
      const nilaiHarga = Number(harga);

      if (
        harga === "" ||
        !Number.isFinite(nilaiHarga) ||
        nilaiHarga < 0 ||
        nilaiHarga > 9999999999.99
      ) {
        return res.status(400).json({
          success: false,
          message: "Harga tidak valid"
        });
      }

      barang.harga = nilaiHarga;
    }

    if (deskripsi !== undefined) {
      barang.deskripsi = deskripsi;
    }

    // Ganti foto jika ada foto baru
    if (req.file) {
      barang.foto = `/uploads/barang/${req.file.filename}`;
    }

    await barang.save();

    res.status(200).json({
      success: true,
      message: "Barang berhasil diperbarui",
      data: formatCatalog(req, barang)
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Hapus Barang
exports.deleteCatalog = async (req, res) => {
  try {
    const barang = await Catalog.findOneAndDelete({
      id_barang: req.params.id
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Barang berhasil dihapus"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
