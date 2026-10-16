const express = require("express");
const router = express.Router();

const layananController = require("../controllers/layananController");

// Mengambil semua layanan
router.get("/", layananController.getAllLayanan);

// Mengambil satu layanan berdasarkan ID
router.get("/:id", layananController.getLayananById);

// Menambahkan layanan
router.post("/", layananController.createLayanan);

// Memperbarui layanan
router.put("/:id", layananController.updateLayanan);

// Menghapus layanan
router.delete("/:id", layananController.deleteLayanan);

module.exports = router;
