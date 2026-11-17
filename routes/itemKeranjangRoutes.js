
const express = require("express");
const router = express.Router();

const {
  getAllItemKeranjang,
  getItemKeranjangById,
  getItemByKeranjang,
  getItemByBarang,
  createItemKeranjang,
  updateItemKeranjang,
  deleteItemKeranjang
} = require("../controllers/itemKeranjangControllers");

// Ambil Semua Item Keranjang
router.get("/", getAllItemKeranjang);

// Ambil Item Berdasarkan Keranjang
router.get("/keranjang/:id_keranjang", getItemByKeranjang);

// Ambil Item Berdasarkan Barang
router.get("/barang/:id_barang", getItemByBarang);

// Ambil Item Berdasarkan ID
router.get("/:id", getItemKeranjangById);

// Tambah Item Keranjang
router.post("/", createItemKeranjang);

// Edit Item Keranjang
router.put("/:id", updateItemKeranjang);

// Hapus Item Keranjang
router.delete("/:id", deleteItemKeranjang);

module.exports = router;
