
const express = require("express");
const router = express.Router();

const shoppingCartController = require("../controllers/shoppingCartControllers");

// Tambah Keranjang
router.post("/", shoppingCartController.createCart);

// Ambil Semua Keranjang
router.get("/", shoppingCartController.getAllCarts);

// Ambil Keranjang Berdasarkan User
router.get("/user/:id_user", shoppingCartController.getCartByUser);

// Ambil Keranjang Berdasarkan ID
router.get("/:id_keranjang", shoppingCartController.getCartById);

// Edit Keranjang
router.put("/:id_keranjang", shoppingCartController.updateCart);

// Hapus Keranjang
router.delete("/:id_keranjang", shoppingCartController.deleteCart);

module.exports = router;
