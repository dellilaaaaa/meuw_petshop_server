const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/auth");
const authController = require("../controllers/authControllers");
const {
  getLaporan,
  updateStatusTransaksi,
  updateStatusBooking,
  createProduk,
  updateProduk,
  deleteProduk,
  createLayanan,
  updateLayanan,
  deleteLayanan
} = require("../controllers/adminController");

const loginHandler = authController.loginUser || authController.login;

// Login Admin & Customer
router.post("/login", loginHandler);

// Laporan & Status Transaksi / Booking
router.get("/laporan", verifyAdmin, getLaporan);
router.put("/transaksi/:id_transaksi/status", verifyAdmin, updateStatusTransaksi);
router.put("/booking/:id_booking/status", verifyAdmin, updateStatusBooking);

// CRUD Produk & Stok Cabang
router.post("/produk", verifyAdmin, createProduk);
router.put("/produk/:id_barang", verifyAdmin, updateProduk);
router.delete("/produk/:id_barang", verifyAdmin, deleteProduk);

// CRUD Layanan Petshop
router.post("/layanan", verifyAdmin, createLayanan);
router.put("/layanan/:id_layanan", verifyAdmin, updateLayanan);
router.delete("/layanan/:id_layanan", verifyAdmin, deleteLayanan);

module.exports = router;