const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  id_review: {
    type: String,
    required: true,
    unique: true
  },
  id_transaksi: {
    type: String,
    required: true,
    unique: true, 
    ref: 'Transaksi'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  komentar: {
    type: String,
    default: ''
  },
  tanggal_review: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('Review', ReviewSchema);