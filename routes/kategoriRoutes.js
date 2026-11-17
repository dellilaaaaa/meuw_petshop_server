
const express = require("express");
const router = express.Router();

const {
  createKategori,
  getAllKategori,
  getKategoriById,
  updateKategori,
  deleteKategori
} = require("../controllers/kategoriControllers");

router.post("/", createKategori);
router.get("/", getAllKategori);
router.get("/:id", getKategoriById);
router.put("/:id", updateKategori);
router.delete("/:id", deleteKategori);

module.exports = router;
