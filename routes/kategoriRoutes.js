const express = require("express");
const router = express.Router();
const {
  createKategori,
  getAllKategori,
  updateKategori,
  deleteKategori,
} = require("../controllers/kategoriControllers");

router.post("/", createKategori);
router.get("/", getAllKategori);
router.put("/:id", updateKategori);
router.delete("/:id", deleteKategori);

module.exports = router;