
const Catalog = require("../models/Catalog");

exports.createCatalog = async (req, res) => {
  try {
    const { nama_barang, id_kategori, harga, deskripsi } = req.body;

    if (!nama_barang || !id_kategori || harga === undefined || harga === "") {
      return res.status(400).json({
        success: false,
        message: "Nama barang, kategori, dan harga wajib diisi"
      });
    }

    const nilaiHarga = Number(harga);

    if (!Number.isFinite(nilaiHarga) || nilaiHarga < 0) {
      return res.status(400).json({
        success: false,
        message: "Harga tidak valid"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Foto wajib diupload"
      });
    }

    const barangBaru = new Catalog({
      nama_barang,
      id_kategori,
      harga: nilaiHarga,
      deskripsi,
      foto: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await barangBaru.save();

    res.status(201).json({
      success: true,
      message: "Barang berhasil ditambahkan!",
      data: {
        _id: barangBaru._id,
        nama_barang: barangBaru.nama_barang,
        id_kategori: barangBaru.id_kategori,
        harga: barangBaru.harga,
        deskripsi: barangBaru.deskripsi
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Ambil semua katalog tanpa mengirim binary foto
exports.getAllCatalog = async (req, res) => {
  try {
    const catalogList = await Catalog.find()
      .select("-foto.data")
      .populate("id_kategori");

    res.status(200).json({
      success: true,
      total: catalogList.length,
      data: catalogList
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Ambil foto katalog
exports.getFotoCatalog = async (req, res) => {
  try {
    const barang = await Catalog.findById(req.params.id)
      .select("foto");

    if (!barang || !barang.foto || !barang.foto.data) {
      return res.status(404).json({
        success: false,
        message: "Foto tidak ditemukan"
      });
    }

    res.set("X-Content-Type-Options", "nosniff");
    res.set("Content-Type", barang.foto.contentType);
    res.send(barang.foto.data);

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Edit katalog
exports.updateCatalog = async (req, res) => {
  try {
    const barang = await Catalog.findById(req.params.id);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan"
      });
    }

    const { nama_barang, id_kategori, harga, deskripsi } = req.body;

    if (nama_barang !== undefined) {
      barang.nama_barang = nama_barang;
    }

    if (id_kategori !== undefined) {
      barang.id_kategori = id_kategori;
    }

    if (harga !== undefined) {
      if (harga === "" || !Number.isFinite(Number(harga)) || Number(harga) < 0) {
        return res.status(400).json({
          success: false,
          message: "Harga tidak valid"
        });
      }

      barang.harga = Number(harga);
    }

    if (deskripsi !== undefined) {
      barang.deskripsi = deskripsi;
    }

    // Ganti foto hanya jika ada foto baru
    if (req.file) {
      barang.foto = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await barang.save();

    res.status(200).json({
      success: true,
      message: "Barang berhasil diperbarui!",
      data: {
        _id: barang._id,
        nama_barang: barang.nama_barang,
        id_kategori: barang.id_kategori,
        harga: barang.harga,
        deskripsi: barang.deskripsi
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Hapus katalog
exports.deleteCatalog = async (req, res) => {
  try {
    const barang = await Catalog.findByIdAndDelete(req.params.id);

    if (!barang) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Barang berhasil dihapus!"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
