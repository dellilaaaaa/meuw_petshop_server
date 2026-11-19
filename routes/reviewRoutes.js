const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewControllers");

router.get("/", reviewController.getAllReview);
router.get("/user/:id_user", reviewController.getReviewByUser);
router.post("/", reviewController.createReview);
router.delete("/:id_review", reviewController.deleteReview);

module.exports = router;