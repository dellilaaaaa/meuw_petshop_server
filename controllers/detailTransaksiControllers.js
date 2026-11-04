const DetailTransaksi = require('../models/DetailTransaksi.js');
const Transaksi = require('../models/Transaksi.js');

exports.getAllDetailTransaksi = async (req, res) => {
  try {
    const detail = await DetailTransaksi.find();
    return res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data detail transaksi',
      error: error.message
    });
  }
};

exports.getDetailByTransaksi = async (req, res) => {
  try {
    const { id_transaksi } = req.params;
    const detail = await DetailTransaksi.find({ id_transaksi });

    return res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail item transaksi',
      error: error.message
    });
  }
};

exports.createDetailTransaksi = async (req, res) => {
  try {
    const { id_detail_transaksi, id_transaksi, id_barang, jumlah, harga_satuan } = req.body;

    const transaksi = await Transaksi.findOne({ id_transaksi });
    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const detailBaru = new DetailTransaksi({
      id_detail_transaksi,
      id_transaksi,
      id_barang,
      jumlah,
      harga_satuan
    });

    await detailBaru.save();

    return res.status(201).json({
      success: true,
      message: 'Detail barang transaksi berhasil ditambahkan',
      data: detailBaru
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan detail barang transaksi',
      error: error.message
    });
  }
};