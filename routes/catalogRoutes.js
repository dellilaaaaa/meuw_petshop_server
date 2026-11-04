
const express = require("express");
const multer = require("multer");
const router = express.Router();

const catalogController = require("../controllers/catalogControllers");

const upload = multer({
  storage: multer.memoryStorage(),
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

// Tambah katalog dengan foto
router.post("/", upload.single("foto"), catalogController.createCatalog);

// Ambil semua katalog
router.get("/", catalogController.getAllCatalog);

// Ambil foto berdasarkan ID katalog
router.get("/:id/foto", catalogController.getFotoCatalog);

// Edit katalog
router.put("/:id", upload.single("foto"), catalogController.updateCatalog);

// Hapus katalog
router.delete("/:id", catalogController.deleteCatalog);

// Penanganan error upload
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