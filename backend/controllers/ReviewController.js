const { Review } = require('../models/Review');

const ReviewController = {
  createReview: async (req, res) => {
    try {
      const review = req.body;

      // Validate the review
      const validationResult = Review.validateReview(review);
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Invalid review',
          details: validationResult.errors
        });
      }

      // Create the review
      const createdReview = await Review.createReview(review);
      res.status(201).json({
        message: 'Review created successfully',
        reviewId: createdReview.id  // Assuming 'id' is the field returned after creation
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        error: 'Error creating review',
        details: error.message
      });
    }
  },

  getTrainingReviews: async (req, res) => {
    const { trainingId } = req.params;
    try {
      // Fetch reviews for a specific training
      const reviews = await Review.getByTraining(trainingId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({
        error: 'Error fetching reviews',
        details: error.message
      });
    }
  },

  getTrainingRating: async (req, res) => {
    const { trainingId } = req.params;
    try {
      // Fetch average rating and review count for a training
      const ratingData = await Review.getAverageRating(trainingId);
      res.status(200).json({
        averageRating: ratingData.average_rating || 0,
        reviewCount: ratingData.review_count || 0
      });
    } catch (error) {
      console.error('Error fetching rating:', error);
      res.status(500).json({
        error: 'Error fetching rating',
        details: error.message
      });
    }
  },

  updateReview: async (req, res) => {
    const { id } = req.params;
    const updatedReview = req.body;
    try {
      // Validate the review update
      const validationResult = Review.validateReview({
        ...updatedReview,
        training_id: 1 // Dummy value to pass validation
      });

      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Invalid review update',
          details: validationResult.errors
        });
      }

      // Update the review
      const updated = await Review.updateReview(id, updatedReview);
      res.status(200).json({ message: 'Review updated successfully' });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        error: 'Error updating review',
        details: error.message
      });
    }
  },

  deleteReview: async (req, res) => {
    const { id } = req.params;
    try {
      // Delete the review by ID
      await Review.deleteReview(id);
      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        error: 'Error deleting review',
        details: error.message
      });
    }
  }
};

module.exports = ReviewController;
