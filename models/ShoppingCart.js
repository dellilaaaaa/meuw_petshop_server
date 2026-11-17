const mongoose = require("mongoose");

const shoppingCartSchema = new mongoose.Schema(
  {
    id_keranjang: {
      type: String,
      required: true,
      unique: true,
      immutable: true
    },
    id_user: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);
