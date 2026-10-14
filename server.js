require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Konek ke MongoDB Atlas
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ Berhasil terhubung ke MongoDB Atlas!"))
  .catch((err) => console.error("❌ Gagal konek ke MongoDB Atlas:", err));

// Routing
app.use("/api/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});