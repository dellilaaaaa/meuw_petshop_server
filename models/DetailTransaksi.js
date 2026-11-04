const mongoose = require('mongoose');

const DetailTransaksiSchema = new mongoose.Schema({
  id_detail_transaksi: {
    type: String,
    required: true,
    unique: true
  },
  id_transaksi: {
    type: String,
    required: true,
    ref: 'Transaksi'
  },
  id_barang: {
    type: String,
    required: true,
    ref: 'Barang'
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

module.exports = mongoose.model('DetailTransaksi', DetailTransaksiSchema);