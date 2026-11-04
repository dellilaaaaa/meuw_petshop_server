const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    id_barang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Catalog",
      required: true
    },
    jumlah: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  },
  { _id: true }
);

const shoppingCartSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);
