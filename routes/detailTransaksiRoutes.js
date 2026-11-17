
const express = require("express");
const router = express.Router();

const detailTransaksiController = require("../controllers/detailTransaksiControllers");

router.get("/", detailTransaksiController.getAllDetailTransaksi);

router.get(
  "/transaksi/:id_transaksi",
  detailTransaksiController.getDetailByTransaksi
);

router.get(
  "/:id",
  detailTransaksiController.getDetailTransaksiById
);

router.post("/", detailTransaksiController.createDetailTransaksi);

module.exports = router;
