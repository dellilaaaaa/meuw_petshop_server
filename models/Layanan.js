
const mongoose = require("mongoose");

const layananSchema = new mongoose.Schema(
  {
    id_layanan: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      maxlength: 4
    },
    nama_layanan: {
      type: String,
      required: [true, "Nama layanan harus diisi"],
      trim: true,
      maxlength: [50, "Nama layanan maksimal 50 karakter"]
    },
    harga: {
      type: Number,
      required: [true, "Harga layanan harus diisi"],
      min: 0,
      max: 9999999999.99
    },
    foto: {
      type: String,
      default: "",
      maxlength: 255
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi layanan harus diisi"]
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model(
  "Layanan",
  layananSchema,
  "layanan"
);
