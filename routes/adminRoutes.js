const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const adminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/auth");

// Login umum (User & Admin)
router.post("/login", authController.login);

// Endpoint Khusus Admin (dilindungi verifyAdmin)
router.get("/laporan", verifyAdmin, adminController.getLaporan);
router.put("/transaksi/:id_transaksi/status", verifyAdmin, adminController.updateStatusTransaksi);
router.put("/booking/:id_booking/status", verifyAdmin, adminController.updateStatusBooking);

module.exports = router;