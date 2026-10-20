
const Store = require("../models/Store");

exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ id_toko: 1 });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findOne({
      id_toko: Number(req.params.id),
    });

    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan" });
    }

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStore = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.status(400).json({
          message: "Data toko tidak boleh kosong",
        });
      }

      const stores = await Store.insertMany(data);

      return res.status(201).json({
        message: "Semua toko berhasil ditambahkan",
        jumlah: stores.length,
        data: stores,
      });
    }

    const store = await Store.create(data);

    return res.status(201).json({
      message: "Toko berhasil ditambahkan",
      data: store,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Gagal menambahkan toko",
      error: error.message,
    });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { id_toko: Number(req.params.id) },
      {
        nama_toko: req.body.nama_toko,
        alamat: req.body.alamat,
      },
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan" });
    }

    res.status(200).json({
      message: "Toko berhasil diperbarui",
      data: store,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({
      id_toko: Number(req.params.id),
    });

    if (!store) {
      return res.status(404).json({ message: "Toko tidak ditemukan" });
    }

    res.status(200).json({ message: "Toko berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
