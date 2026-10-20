require("dotenv").config();

// Tambahkan ini untuk mengatur DNS Node.js
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Load/register model Kategori agar Mongoose mengenalnya sebelum melakukan .populate()
require("./models/Kategori");

// Konek ke MongoDB Atlas
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ Berhasil terhubung ke MongoDB Atlas!"))
  .catch((err) => console.error("❌ Gagal konek ke MongoDB Atlas:", err));

// Routing (Disesuaikan dengan nama file fisik di folder routes)
app.use("/api/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});