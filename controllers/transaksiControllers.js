const Transaksi = require('../models/Transaksi.js');
const HistoriTransaksi = require('../models/HistoriTransaksi.js');

exports.getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await Transaksi.find().sort({ tanggal: -1 });
    return res.status(200).json({
      success: true,
      data: transaksi
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data transaksi',
      error: error.message
    });
  }
};

exports.getTransaksiById = async (req, res) => {
  try {
    const { id_transaksi } = req.params;
    const transaksi = await Transaksi.findOne({ id_transaksi });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      data: transaksi
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail transaksi',
      error: error.message
    });
  }
};

exports.createTransaksi = async (req, res) => {
  try {
    const { id_transaksi, id_user, id_toko, total_harga, status } = req.body;

    const statusAwal = status || 'Pending';

    const transaksiBaru = new Transaksi({
      id_transaksi,
      id_user,
      id_toko,
      total_harga,
      status: statusAwal
    });

    await transaksiBaru.save();

    const idHistoriBaru = 'H' + Math.floor(1000 + Math.random() * 9000);
    await HistoriTransaksi.create({
      id_histori: idHistoriBaru,
      id_transaksi: id_transaksi,
      status_sebelumnya: null,
      status_terbaru: statusAwal,
      catatan: 'Transaksi berhasil dibuat'
    });

    return res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat dan histori awal dicatat',
      data: transaksiBaru
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat transaksi',
      error: error.message
    });
  }
};

exports.updateStatusTransaksi = async (req, res) => {
  try {
    const { id_transaksi } = req.params;
    const { status_terbaru, catatan } = req.body;

    const transaksi = await Transaksi.findOne({ id_transaksi });
    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const statusSebelumnya = transaksi.status;

    transaksi.status = status_terbaru;
    await transaksi.save();

    const idHistoriBaru = 'H' + Math.floor(1000 + Math.random() * 9000);
    await HistoriTransaksi.create({
      id_histori: idHistoriBaru,
      id_transaksi: id_transaksi,
      status_sebelumnya: statusSebelumnya,
      status_terbaru: status_terbaru,
      catatan: catatan || `Status diubah dari ${statusSebelumnya} menjadi ${status_terbaru}`
    });

    return res.status(200).json({
      success: true,
      message: 'Status transaksi berhasil diperbarui dan histori dicatat',
      data: transaksi
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status transaksi',
      error: error.message
    });
  }
};