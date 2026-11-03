const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiControllers');

router.get('/', transaksiController.getAllTransaksi);

router.get('/:id_transaksi', transaksiController.getTransaksiById);

router.post('/', transaksiController.createTransaksi);

router.put('/:id_transaksi/status', transaksiController.updateStatusTransaksi);

module.exports = router;