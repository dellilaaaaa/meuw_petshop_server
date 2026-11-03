require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();

app.use(cors());
// Middleware JSON Parser
app.use(express.json());

const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// Load Model
require("./models/Kategori");
require("./models/HistoriTransaksi");
require("./models/Transaksi");

// --- PERBAIKAN KONEKSI MONGODB UNTUK VERCEL SERVERLESS ---
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.DB_URL);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ Berhasil terhubung ke MongoDB Atlas!");
  } catch (err) {
    console.error("❌ Gagal koneksi ke MongoDB Atlas:", err);
    throw err;
  }
};

// Middleware wajib: pastikan DB terhubung SEBELUM masuk ke rute API
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Gagal terhubung ke Database", 
      error: err.message 
    });
  }
});

// Routing
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/kategori-barang", require("./routes/kategoriRoutes"));
app.use("/api/catalog", require("./routes/catalogRoutes"));
app.use("/api/stores", require("./routes/storeRoutes"));
app.use("/api/layanan", require("./routes/layananRoutes"));
app.use("/api/histori-transaksi", require("./routes/historiRoutes"));
app.use("/api/transaksi", require("./routes/transaksiRoutes"));

// Hanya jalankan app.listen jika tidak berjalan di lingkungan Vercel Serverless
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running di http://localhost:${PORT}`);
  });
}

// Export app agar bisa dibaca oleh Vercel Serverless Engine
module.exports = app;