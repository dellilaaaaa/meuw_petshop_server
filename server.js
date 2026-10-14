require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware supaya Express bisa membaca format JSON dari Postman
app.use(express.json());

// 1. Koneksi ke MongoDB Atlas via DB_URL di file .env
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ Berhasil terhubung ke MongoDB Atlas!"))
  .catch((err) => console.error("❌ Gagal konek ke MongoDB Atlas:", err));

// 2. Endpoint Tes
app.get("/", (req, res) => {
  res.json({ message: "API Petshop Siap Digunakan!" });
});

// 3. Jalankan Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});