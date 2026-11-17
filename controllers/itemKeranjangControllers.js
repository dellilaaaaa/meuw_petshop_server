
const mongoose = require("mongoose");
const ItemKeranjang = require("../models/ItemKeranjang");
const ShoppingCart = require("../models/ShoppingCart");
const Catalog = require("../models/Catalog");

// Ambil Semua Item Keranjang
exports.getAllItemKeranjang = async (req, res) => {
  try {
    const data = await ItemKeranjang.find();

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

// Ambil Item Keranjang Berdasarkan ID
exports.getItemKeranjangById = async (req, res) => {
  try {
    const data = await ItemKeranjang.findOne({
      id_item_keranjang: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Item keranjang tidak ditemukan"
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

// Ambil Item Berdasarkan ID Keranjang
exports.getItemByKeranjang = async (req, res) => {
  try {
    const data = await ItemKeranjang.find({
      id_keranjang: req.params.id_keranjang
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

// Ambil Item Berdasarkan ID Barang
exports.getItemByBarang = async (req, res) => {
  try {
    const data = await ItemKeranjang.find({
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

// Tambah Item Keranjang
exports.createItemKeranjang = async (req, res) => {
  try {
    const { id_keranjang, id_barang, jumlah } = req.body;

    if (!id_keranjang || !id_barang || jumlah === undefined) {
      return res.status(400).json({
        success: false,
        message: "ID Keranjang, ID Barang, dan jumlah wajib diisi"
      });
    }

    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return res.status(400).json({
        success: false,
        message: "Jumlah minimal adalah 1"
      });
    }

    // Cek Keranjang
    const keranjang = await ShoppingCart.findOne({
      id_keranjang
    });

    if (!keranjang) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan"
      });
    }

    // Cek Barang
    const barang = await Catalog.findOne({
      id_barang
    });

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan"
      });
    }

    // Auto Increment ID Item Keranjang
    const counters = mongoose.connection.collection("counters");

    const counter = await counters.findOneAndUpdate(
      { _id: "item_keranjang" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    if (counter.seq > 9999) {
      return res.status(400).json({
        success: false,
        message: "Batas ID Item Keranjang telah tercapai"
      });
    }

    const data = await ItemKeranjang.create({
      id_item_keranjang: String(counter.seq),
      id_keranjang,
      id_barang,
      jumlah
    });

    res.status(201).json({
      success: true,
      message: "Item keranjang berhasil ditambahkan",
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Edit Item Keranjang
exports.updateItemKeranjang = async (req, res) => {
  try {
    const data = await ItemKeranjang.findOne({
      id_item_keranjang: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Item keranjang tidak ditemukan"
      });
    }

    const { id_keranjang, id_barang, jumlah } = req.body;

    if (id_keranjang !== undefined) {
      const keranjang = await ShoppingCart.findOne({
        id_keranjang
      });

      if (!keranjang) {
        return res.status(404).json({
          success: false,
          message: "Keranjang tidak ditemukan"
        });
      }

      data.id_keranjang = id_keranjang;
    }

    if (id_barang !== undefined) {
      const barang = await Catalog.findOne({
        id_barang
      });

      if (!barang) {
        return res.status(404).json({
          success: false,
          message: "Barang tidak ditemukan"
        });
      }

      data.id_barang = id_barang;
    }

    if (jumlah !== undefined) {
      if (!Number.isInteger(jumlah) || jumlah < 1) {
        return res.status(400).json({
          success: false,
          message: "Jumlah minimal adalah 1"
        });
      }

      data.jumlah = jumlah;
    }

    await data.save();

    res.status(200).json({
      success: true,
      message: "Item keranjang berhasil diperbarui",
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Hapus Item Keranjang
exports.deleteItemKeranjang = async (req, res) => {
  try {
    const data = await ItemKeranjang.findOneAndDelete({
      id_item_keranjang: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Item keranjang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Item keranjang berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
