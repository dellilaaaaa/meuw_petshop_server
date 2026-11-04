const Review = require('../models/Review.js');
const Transaksi = require('../models/Transaksi.js');

exports.getAllReview = async (req, res) => {
  try {
    const review = await Review.find().sort({ tanggal_review: -1 });
    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data review',
      error: error.message
    });
  }
};

exports.getReviewByTransaksi = async (req, res) => {
  try {
    const { id_transaksi } = req.params;
    const review = await Review.findOne({ id_transaksi });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review untuk transaksi ini belum ada'
      });
    }

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail review',
      error: error.message
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { id_review, id_transaksi, rating, komentar } = req.body;

    // Cek apakah transaksi ada
    const transaksi = await Transaksi.findOne({ id_transaksi });
    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const reviewAda = await Review.findOne({ id_transaksi });
    if (reviewAda) {
      return res.status(400).json({
        success: false,
        message: 'Transaksi ini sudah pernah diberi ulasan'
      });
    }

    const reviewBaru = new Review({
      id_review,
      id_transaksi,
      rating,
      komentar
    });

    await reviewBaru.save();

    return res.status(201).json({
      success: true,
      message: 'Review berhasil ditambahkan',
      data: reviewBaru
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan review',
      error: error.message
    });
  }
};