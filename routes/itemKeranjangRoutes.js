const express = require("express");
const router = express.Router();

const {
    getAllItemKeranjang,
    getItemKeranjangById,
    getItemByKeranjang,
    createItemKeranjang,
    updateItemKeranjang,
    deleteItemKeranjang
} = require("../controllers/itemKeranjangControllers");

router.get("/", getAllItemKeranjang);
router.get("/keranjang/:id_keranjang", getItemByKeranjang);
router.get("/:id", getItemKeranjangById);
router.post("/", createItemKeranjang);
router.put("/:id", updateItemKeranjang);
router.delete("/:id", deleteItemKeranjang);

module.exports = router;