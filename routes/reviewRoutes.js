const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewControllers');

router.get('/', reviewController.getAllReview);

router.get('/transaksi/:id_transaksi', reviewController.getReviewByTransaksi);

router.post('/', reviewController.createReview);

module.exports = router;