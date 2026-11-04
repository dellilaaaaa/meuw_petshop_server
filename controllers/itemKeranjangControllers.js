const ItemKeranjang = require("../models/ItemKeranjang");

exports.getAllItemKeranjang = async (req, res) => {
    try {
        const data = await ItemKeranjang.find();

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getItemKeranjangById = async (req, res) => {
    try {
        const data = await ItemKeranjang.findOne({
            id_item_keranjang: req.params.id
        });

        if (!data) {
            return res.status(404).json({
                message: "Item keranjang tidak ditemukan"
            });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getItemByKeranjang = async (req, res) => {
    try {
        const data = await ItemKeranjang.find({
            id_keranjang: req.params.id_keranjang
        });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.createItemKeranjang = async (req, res) => {
    try {
        const lastItem = await ItemKeranjang.findOne()
            .sort({ id_item_keranjang: -1 });

        let nextNumber = 1;

        if (lastItem) {
            nextNumber =
                parseInt(lastItem.id_item_keranjang.replace("ITK", "")) + 1;
        }

        const newId = "ITK" + nextNumber;

        const data = await ItemKeranjang.create({
            id_item_keranjang: newId,
            id_keranjang: req.body.id_keranjang,
            id_barang: req.body.id_barang,
            jumlah: req.body.jumlah
        });

        res.status(201).json({
            message: "Item keranjang berhasil ditambahkan",
            data
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

exports.updateItemKeranjang = async (req, res) => {
    try {
        const data = await ItemKeranjang.findOneAndUpdate(
            { id_item_keranjang: req.params.id },
            {
                id_keranjang: req.body.id_keranjang,
                id_barang: req.body.id_barang,
                jumlah: req.body.jumlah
            },
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).json({
                message: "Item keranjang tidak ditemukan"
            });
        }

        res.status(200).json({
            message: "Item keranjang berhasil diperbarui",
            data
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

exports.deleteItemKeranjang = async (req, res) => {
    try {
        const data = await ItemKeranjang.findOneAndDelete({
            id_item_keranjang: req.params.id
        });

        if (!data) {
            return res.status(404).json({
                message: "Item keranjang tidak ditemukan"
            });
        }

        res.status(200).json({
            message: "Item keranjang berhasil dihapus",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};