
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const catalogController = require("../controllers/catalogControllers");

// Folder penyimpanan foto
const uploadDir = path.join(__dirname, "../uploads/barang");

fs.mkdirSync(uploadDir, { recursive: true });

// Konfigurasi Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = Date.now() + "-" + Math.round(Math.random() * 1E9) + extension;

    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format foto harus JPG, PNG, atau WEBP"));
    }
  }
});

// Tambah Barang
router.post("/", upload.single("foto"), catalogController.createCatalog);

// Ambil Semua Barang
router.get("/", catalogController.getAllCatalog);

// Ambil Barang Berdasarkan ID
router.get("/:id", catalogController.getCatalogById);

// Edit Barang
router.put("/:id", upload.single("foto"), catalogController.updateCatalog);

// Hapus Barang
router.delete("/:id", catalogController.deleteCatalog);

// Penanganan Error Upload
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
});

module.exports = router;
