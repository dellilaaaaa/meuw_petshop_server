const mongoose = require("mongoose");
const Review = require("../models/Review");
const Transaksi = require("../models/Transaksi");
const User = require("../models/User");

// Generate ID Review Auto Increment
const generateReviewId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "review" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID review sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 1. Tampilkan Semua Review
exports.getAllReview = async (req, res) => {
  try {
    const review = await Review.find().sort({ tanggal_review: -1 });

    res.status(200).json({
      success: true,
      total: review.length,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data review",
      error: error.message
    });
  }
};

// 2. Tampilkan Review Milik User
exports.getReviewByUser = async (req, res) => {
  try {
    const review = await Review.findOne({ id_user: req.params.id_user });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "User ini belum membuat review"
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil review user",
      error: error.message
    });
  }
};

// 3. Tambah Review (1 user maksimal 1 review, harus sudah checkout)
exports.createReview = async (req, res) => {
  try {
    const { id_user, rating, komentar } = req.body;

    if (!id_user || rating === undefined || rating === "") {
      return res.status(400).json({
        success: false,
        message: "ID user dan rating harus diisi"
      });
    }

    const nilaiRating = Number(rating);

    if (
      !Number.isInteger(nilaiRating) ||
      nilaiRating < 1 ||
      nilaiRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating harus berupa bilangan bulat dari 1 sampai 5"
      });
    }

    if (komentar !== undefined && typeof komentar !== "string") {
      return res.status(400).json({
        success: false,
        message: "Komentar harus berupa teks"
      });
    }

    // User harus ada
    const user = await User.findOne({ id_user });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    // Syarat: user sudah pernah checkout (punya transaksi yang tidak dibatalkan)
    const sudahCheckout = await Transaksi.findOne({
      id_user,
      status: { $ne: "Dibatalkan" }
    });

    if (!sudahCheckout) {
      return res.status(403).json({
        success: false,
        message: "Selesaikan transaksi terlebih dahulu sebelum membuat review"
      });
    }

    // Syarat: 1 user maksimal 1 review
    const reviewAda = await Review.findOne({ id_user });

    if (reviewAda) {
      return res.status(400).json({
        success: false,
        message: "Kamu sudah membuat review"
      });
    }

    const id_review = await generateReviewId();

    const reviewBaru = await Review.create({
      id_review,
      id_user,
      rating: nilaiRating,
      komentar: komentar || ""
    });

    res.status(201).json({
      success: true,
      message: "Review berhasil ditambahkan",
      data: reviewBaru
    });
  } catch (error) {
    // Jaga-jaga kalau dua request masuk bersamaan (dicegah index unik id_user)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Kamu sudah membuat review"
      });
    }

    res.status(400).json({
      success: false,
      message: "Gagal menambahkan review",
      error: error.message
    });
  }
};

// 4. Hapus Review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      id_review: req.params.id_review
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus review",
      error: error.message
    });
  }
};