
const mongoose = require("mongoose");

const bookingLayananSchema = new mongoose.Schema(
  {
    id_booking: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    id_detail_layanan: {
      type: String,
      required: true,
      unique: true
    },
    tanggal_mulai: {
      type: Date,
      required: true
    },
    jam_mulai: {
      type: String,
      required: true
    },
    tanggal_selesai: {
      type: Date,
      required: true
    },
    status_booking: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true
    }
  },
  {
    versionKey: false,
    collection: "booking_layanans"
  }
);

module.exports = mongoose.model("BookingLayanan", bookingLayananSchema);
