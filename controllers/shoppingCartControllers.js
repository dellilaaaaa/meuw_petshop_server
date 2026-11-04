const ShoppingCart = require("../models/ShoppingCart");
const Catalog = require("../models/Catalog");

exports.getCart = async (req, res) => {
  try {
    const { id_user } = req.params;

    let cart = await ShoppingCart.findOne({ id_user })
      .populate("items.id_barang");

    if (!cart) {
      cart = await ShoppingCart.create({
        id_user,
        items: []
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil data keranjang",
      data: cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { id_barang, jumlah } = req.body;

    if (!id_barang || !Number.isInteger(jumlah) || jumlah < 1) {
      return res.status(400).json({
        message: "ID barang dan jumlah wajib diisi dengan benar"
      });
    }

    const barang = await Catalog.findById(id_barang);

    if (!barang) {
      return res.status(404).json({
        message: "Barang tidak ditemukan"
      });
    }

    let cart = await ShoppingCart.findOne({ id_user });

    if (!cart) {
      cart = new ShoppingCart({
        id_user,
        items: []
      });
    }

    const existingItem = cart.items.find(
      item => item.id_barang.toString() === id_barang
    );

    if (existingItem) {
      existingItem.jumlah += jumlah;
    } else {
      cart.items.push({
        id_barang,
        jumlah
      });
    }

    await cart.save();
    await cart.populate("items.id_barang");

    res.status(201).json({
      message: "Barang berhasil ditambahkan ke keranjang",
      data: cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { id_user, id_barang } = req.params;
    const { jumlah } = req.body;

    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return res.status(400).json({
        message: "Jumlah minimal adalah 1"
      });
    }

    const cart = await ShoppingCart.findOne({ id_user });

    if (!cart) {
      return res.status(404).json({
        message: "Keranjang tidak ditemukan"
      });
    }

    const item = cart.items.find(
      item => item.id_barang.toString() === id_barang
    );

    if (!item) {
      return res.status(404).json({
        message: "Barang tidak ditemukan di keranjang"
      });
    }

    item.jumlah = jumlah;

    await cart.save();
    await cart.populate("items.id_barang");

    res.status(200).json({
      message: "Jumlah barang berhasil diperbarui",
      data: cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { id_user, id_barang } = req.params;

    const cart = await ShoppingCart.findOne({ id_user });

    if (!cart) {
      return res.status(404).json({
        message: "Keranjang tidak ditemukan"
      });
    }

    const itemExists = cart.items.some(
      item => item.id_barang.toString() === id_barang
    );

    if (!itemExists) {
      return res.status(404).json({
        message: "Barang tidak ditemukan di keranjang"
      });
    }

    cart.items = cart.items.filter(
      item => item.id_barang.toString() !== id_barang
    );

    await cart.save();
    await cart.populate("items.id_barang");

    res.status(200).json({
      message: "Barang berhasil dihapus",
      data: cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { id_user } = req.params;

    const cart = await ShoppingCart.findOne({ id_user });

    if (!cart) {
      return res.status(404).json({
        message: "Keranjang tidak ditemukan"
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      message: "Keranjang berhasil dikosongkan",
      data: cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
