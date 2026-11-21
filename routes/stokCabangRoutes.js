
const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  getAllStokCabang,
  getStokCabangById,
  getStokByToko,
  getStokByBarang,
  createStokCabang,
  updateStokCabang,
  deleteStokCabang
} = require("../controllers/stokCabangController");

// Middleware untuk membaca form-data tanpa file
const upload = multer();

router.get("/", getAllStokCabang);
router.get("/toko/:id_toko", getStokByToko);
router.get("/barang/:id_barang", getStokByBarang);
router.get("/:id", getStokCabangById);

router.post("/", upload.none(), createStokCabang);
router.put("/:id", upload.none(), updateStokCabang);

router.delete("/:id", deleteStokCabang);

module.exports = router;
