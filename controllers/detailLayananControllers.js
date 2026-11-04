const DetailLayanan = require('../models/DetailLayanan.js');
const Transaksi = require('../models/Transaksi.js');

exports.getAllDetailLayanan = async (req, res) => {
  try {
    const detail = await DetailLayanan.find();
    return res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data detail layanan',
      error: error.message
    });
  }
};

exports.getDetailByTransaksi = async (req, res) => {
  try {
    const { id_transaksi } = req.params;
    const detail = await DetailLayanan.find({ id_transaksi });

    return res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail layanan transaksi',
      error: error.message
    });
  }
};

exports.createDetailLayanan = async (req, res) => {
  try {
    const { id_detail_layanan, id_transaksi, id_layanan, jumlah, harga_satuan } = req.body;

    const transaksi = await Transaksi.findOne({ id_transaksi });
    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const detailBaru = new DetailLayanan({
      id_detail_layanan,
      id_transaksi,
      id_layanan,
      jumlah,
      harga_satuan
    });

    await detailBaru.save();

    return res.status(201).json({
      success: true,
      message: 'Detail layanan berhasil ditambahkan',
      data: detailBaru
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan detail layanan',
      error: error.message
    });
  }
};