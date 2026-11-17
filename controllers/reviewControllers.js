
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Transaksi = require("../models/Transaksi");

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
    const review = await Review.find().sort({
      tanggal_review: -1
    });

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

// 2. Tampilkan Review Berdasarkan Transaksi
exports.getReviewByTransaksi = async (req, res) => {
  try {
    const review = await Review.findOne({
      id_transaksi: req.params.id_transaksi
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review untuk transaksi ini belum ada"
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail review",
      error: error.message
    });
  }
};

// 3. Tambah Review
exports.createReview = async (req, res) => {
  try {
    const { id_transaksi, rating, komentar } = req.body;

    // Validasi input
    if (!id_transaksi || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "ID transaksi dan rating harus diisi"
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

    // Cek apakah transaksi ada
    const transaksi = await Transaksi.findOne({
      id_transaksi
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    // Cek apakah transaksi sudah memiliki review
    const reviewAda = await Review.findOne({
      id_transaksi
    });

    if (reviewAda) {
      return res.status(400).json({
        success: false,
        message: "Transaksi ini sudah pernah diberi ulasan"
      });
    }

    const id_review = await generateReviewId();

    const reviewBaru = await Review.create({
      id_review,
      id_transaksi,
      rating: nilaiRating,
      komentar: komentar || ""
    });

    res.status(201).json({
      success: true,
      message: "Review berhasil ditambahkan",
      data: reviewBaru
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal menambahkan review",
      error: error.message
    });
  }
};
