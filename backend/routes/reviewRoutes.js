const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');

// Create a new review
router.post('/', ReviewController.createReview);

// Get reviews for a specific training
router.get('/training/:trainingId', ReviewController.getTrainingReviews);

// Get average rating for a training
router.get('/training/:trainingId/rating', ReviewController.getTrainingRating);

// Update a specific review
router.put('/:id', ReviewController.updateReview);

// Delete a specific review
router.delete('/:id', ReviewController.deleteReview);

module.exports = router;