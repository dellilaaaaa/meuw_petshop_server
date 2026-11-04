require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// Load Model
require("./models/Kategori");
require("./models/HistoriTransaksi");
require("./models/Transaksi");
require("./models/Review");
require("./models/DetailLayanan");
require("./models/DetailTransaksi");

mongoose.connection.on("error", (err) => {
  console.error("❌ Error pada koneksi MongoDB:", err);
});

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
app.use("/api/histori-transaksi", require("./routes/historiRoutes"));
app.use("/api/transaksi", require("./routes/transaksiRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));
app.use("/api/detail-layanan", require("./routes/detailLayananRoutes"));
app.use("/api/detail-transaksi", require("./routes/detailTransaksiRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});