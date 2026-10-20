const Layanan = require("../models/Layanan");

// Mengambil semua layanan
exports.getAllLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.find().sort({ id_layanan: 1 });

    res.status(200).json(layanan);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data layanan",
      error: error.message,
    });
  }
};

// Mengambil satu layanan berdasarkan ID
exports.getLayananById = async (req, res) => {
  try {
    const layanan = await Layanan.findOne({
      id_layanan: Number(req.params.id),
    });

    if (!layanan) {
      return res.status(404).json({
        message: "Layanan tidak ditemukan",
      });
    }

    res.status(200).json(layanan);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data layanan",
      error: error.message,
    });
  }
};

// Menambahkan satu atau beberapa layanan
exports.createLayanan = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.status(400).json({
          message: "Data layanan tidak boleh kosong",
        });
      }

      const layanan = await Layanan.insertMany(data);

      return res.status(201).json({
        message: "Semua layanan berhasil ditambahkan",
        jumlah: layanan.length,
        data: layanan,
      });
    }

    const layanan = await Layanan.create(data);

    res.status(201).json({
      message: "Layanan berhasil ditambahkan",
      data: layanan,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal menambahkan layanan",
      error: error.message,
    });
  }
};

// Memperbarui layanan
exports.updateLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.findOneAndUpdate(
      { id_layanan: Number(req.params.id) },
      {
        nama_layanan: req.body.nama_layanan,
        deskripsi: req.body.deskripsi,
        harga: req.body.harga,
      },
      { new: true, runValidators: true }
    );

    if (!layanan) {
      return res.status(404).json({
        message: "Layanan tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Layanan berhasil diperbarui",
      data: layanan,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal memperbarui layanan",
      error: error.message,
    });
  }
};

// Menghapus layanan
exports.deleteLayanan = async (req, res) => {
  try {
    const layanan = await Layanan.findOneAndDelete({
      id_layanan: Number(req.params.id),
    });

    if (!layanan) {
      return res.status(404).json({
        message: "Layanan tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Layanan berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus layanan",
      error: error.message,
    });
  }
};
