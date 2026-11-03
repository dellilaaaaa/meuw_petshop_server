const express = require('express');
const router = express.Router();
const historiController = require('../controllers/historiController.js');

router.get('/:id_transaksi', historiController.getHistoriByTransaksi);

router.post('/', historiController.addHistori);

module.exports = router;