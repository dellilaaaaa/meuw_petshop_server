const Catalog = require("../models/Catalog");

exports.createCatalog = async (req, res) => {
  try {
    const { nama_barang, id_kategori, harga, foto, deskripsi } = req.body;

    const barangBaru = new Catalog({
      nama_barang,
      id_kategori,
      harga,
      foto,
      deskripsi,
    });

    await barangBaru.save();

    res.status(201).json({
      success: true,
      message: "Barang berhasil ditambahkan!",
      data: barangBaru,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCatalog = async (req, res) => {
  try {
    const catalogList = await Catalog.find().populate("id_kategori");

    res.status(200).json({
      success: true,
      total: catalogList.length,
      data: catalogList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCatalog = async (req, res) => {
  try {
    const barang = await Catalog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Barang berhasil diperbarui!",
      data: barang,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteCatalog = async (req, res) => {
  try {
    const barang = await Catalog.findByIdAndDelete(req.params.id);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Barang berhasil dihapus!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};