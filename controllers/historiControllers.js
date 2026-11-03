const HistoriTransaksi = require('../models/HistoriTransaksi.js');

exports.getHistoriByTransaksi = async (req, res) => {
  try {
    const { id_transaksi } = req.params;
    const histori = await HistoriTransaksi.find({ id_transaksi }).sort({ tanggal_perubahan: -1 });

    return res.status(200).json({
      success: true,
      data: histori
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data histori transaksi',
      error: error.message
    });
  }
};

exports.addHistori = async (req, res) => {
  try {
    const { id_histori, id_transaksi, status_sebelumnya, status_terbaru, catatan } = req.body;

    const historiBaru = new HistoriTransaksi({
      id_histori,
      id_transaksi,
      status_sebelumnya,
      status_terbaru,
      catatan
    });

    await historiBaru.save();

    return res.status(201).json({
      success: true,
      message: 'Histori berhasil dicatat',
      data: historiBaru
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mencatat histori',
      error: error.message
    });
  }
};