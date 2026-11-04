const mongoose = require("mongoose");

const itemKeranjangSchema = new mongoose.Schema({
    id_item_keranjang: {
        type: String,
        required: true,
        unique: true
    },
    id_keranjang: {
        type: String,
        required: true,
        ref: "ShoppingCart"
    },
    id_barang: {
        type: String,
        required: true,
        ref: "Catalog"
    },
    jumlah: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    collection: "item_keranjangs",
    timestamps: false
});

module.exports = mongoose.model("ItemKeranjang", itemKeranjangSchema);