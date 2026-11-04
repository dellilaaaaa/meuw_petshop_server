const mongoose = require('mongoose');

const DetailLayananSchema = new mongoose.Schema({
  id_detail_layanan: {
    type: String,
    required: true,
    unique: true
  },
  id_transaksi: {
    type: String,
    required: true,
    ref: 'Transaksi'
  },
  id_layanan: {
    type: String,
    required: true,
    ref: 'Layanan'
  },
  jumlah: {
    type: Number,
    required: true,
    min: 1
  },
  harga_satuan: {
    type: Number,
    required: true
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('DetailLayanan', DetailLayananSchema);