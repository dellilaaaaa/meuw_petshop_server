
const mongoose = require("mongoose");
const ShoppingCart = require("../models/ShoppingCart");
const User = require("../models/User");

// Tambah Keranjang Baru
exports.createCart = async (req, res) => {
  try {
    const { id_user } = req.body;

    if (!id_user) {
      return res.status(400).json({
        success: false,
        message: "ID User wajib diisi"
      });
    }

    // Cek User
    const user = await User.findOne({ id_user });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    // Cek apakah User sudah memiliki keranjang
    const existingCart = await ShoppingCart.findOne({ id_user });

    if (existingCart) {
      return res.status(400).json({
        success: false,
        message: "User sudah memiliki keranjang"
      });
    }

    // Auto Increment ID Keranjang
    const counters = mongoose.connection.collection("counters");

    const counter = await counters.findOneAndUpdate(
      { _id: "keranjang" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    if (counter.seq > 9999) {
      return res.status(400).json({
        success: false,
        message: "Batas ID Keranjang telah tercapai"
      });
    }

    const cart = await ShoppingCart.create({
      id_keranjang: String(counter.seq),
      id_user
    });

    res.status(201).json({
      success: true,
      message: "Keranjang berhasil dibuat",
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ambil Semua Data Keranjang
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await ShoppingCart.find();

    res.status(200).json({
      success: true,
      total: carts.length,
      data: carts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ambil Keranjang Berdasarkan ID
exports.getCartById = async (req, res) => {
  try {
    const cart = await ShoppingCart.findOne({
      id_keranjang: req.params.id_keranjang
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ambil Keranjang Berdasarkan ID User
exports.getCartByUser = async (req, res) => {
  try {
    const cart = await ShoppingCart.findOne({
      id_user: req.params.id_user
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Edit Data Keranjang
exports.updateCart = async (req, res) => {
  try {
    const cart = await ShoppingCart.findOne({
      id_keranjang: req.params.id_keranjang
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan"
      });
    }

    const { id_user } = req.body;

    if (id_user !== undefined) {
      const user = await User.findOne({ id_user });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan"
        });
      }

      const existingCart = await ShoppingCart.findOne({
        id_user,
        id_keranjang: { $ne: cart.id_keranjang }
      });

      if (existingCart) {
        return res.status(400).json({
          success: false,
          message: "User sudah memiliki keranjang lain"
        });
      }

      cart.id_user = id_user;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Keranjang berhasil diperbarui",
      data: cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Hapus Keranjang
exports.deleteCart = async (req, res) => {
  try {
    const cart = await ShoppingCart.findOneAndDelete({
      id_keranjang: req.params.id_keranjang
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Keranjang berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
