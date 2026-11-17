
const express = require("express");
const router = express.Router();

const {
  getAllStokCabang,
  getStokCabangById,
  getStokByToko,
  getStokByBarang,
  createStokCabang,
  updateStokCabang,
  deleteStokCabang
} = require("../controllers/stokCabangController");

router.get("/", getAllStokCabang);
router.get("/toko/:id_toko", getStokByToko);
router.get("/barang/:id_barang", getStokByBarang);
router.get("/:id", getStokCabangById);
router.post("/", createStokCabang);
router.put("/:id", updateStokCabang);
router.delete("/:id", deleteStokCabang);

module.exports = router;
