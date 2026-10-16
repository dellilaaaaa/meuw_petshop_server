const mongoose = require("mongoose");

const layananSchema = new mongoose.Schema(
  {
    id_layanan: {
      type: Number,
      required: true,
      unique: true,
    },
    nama_layanan: {
      type: String,
      required: true,
      trim: true,
    },
    deskripsi: {
      type: String,
      required: true,
      trim: true,
    },
    harga: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model(
  "Layanan",
  layananSchema,
  "layanan"
);
