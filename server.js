require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware JSON Parser
app.use(express.json());

// Opsional: atur resolusi IP jika mengalami masalah DNS lokal pada IPv6
const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// Load Model (jika memang dibutuhkan global sebelum populate)
require("./models/Kategori");

// Event listener untuk koneksi Mongoose
mongoose.connection.on("error", (err) => {
  console.error("❌ Error pada koneksi MongoDB:", err);
});

// Konek ke MongoDB Atlas
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ Berhasil terhubung ke MongoDB Atlas!"))
  .catch((err) => console.error("❌ Gagal koneksi awal ke MongoDB Atlas:", err));

// Routing
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/kategori-barang", require("./routes/kategoriRoutes"));
app.use("/api/catalog", require("./routes/catalogRoutes"));
app.use("/api/stores", require("./routes/storeRoutes"));
app.use("/api/layanan", require("./routes/layananRoutes"));

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});