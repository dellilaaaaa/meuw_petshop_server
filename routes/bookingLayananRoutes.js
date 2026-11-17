
const express = require("express");
const router = express.Router();

const {
  getAllBooking,
  getBookingById,
  getBookingByDetail,
  createBooking,
  updateBooking,
  deleteBooking
} = require("../controllers/bookingLayananControllers");

router.get("/", getAllBooking);
router.get("/detail/:id_detail_layanan", getBookingByDetail);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
