const KategoriBarang = require("../models/Kategori");

exports.createKategori = async (req, res) => {
  try {
    const { nama_kategori } = req.body;

    const kategoriBaru = new KategoriBarang({ nama_kategori });
    await kategoriBaru.save();

    res.status(201).json({
      success: true,
      message: "Kategori barang berhasil ditambahkan!",
      data: kategoriBaru,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllKategori = async (req, res) => {
  try {
    const kategoriList = await KategoriBarang.find();

    res.status(200).json({
      success: true,
      total: kategoriList.length,
      data: kategoriList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateKategori = async (req, res) => {
  try {
    const kategori = await KategoriBarang.findByIdAndUpdate(
      req.params.id,
      { nama_kategori: req.body.nama_kategori },
      { new: true, runValidators: true }
    );

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui!",
      data: kategori,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Hapus Kategori (DELETE)
exports.deleteKategori = async (req, res) => {
  try {
    const kategori = await KategoriBarang.findByIdAndDelete(req.params.id);

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};