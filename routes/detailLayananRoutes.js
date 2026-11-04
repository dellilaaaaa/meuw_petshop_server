const express = require('express');
const router = express.Router();
const detailLayananController = require('../controllers/detailLayananControllers');

router.get('/', detailLayananController.getAllDetailLayanan);
router.get('/transaksi/:id_transaksi', detailLayananController.getDetailByTransaksi);
router.post('/', detailLayananController.createDetailLayanan);

module.exports = router;