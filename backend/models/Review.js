// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// const db = new sqlite3.Database(path.resolve(__dirname, '../traininginrwanda1.db'));

// const Review = {
//   create: (review, callback) => {
//     db.run(
//       `INSERT INTO reviews (
//         training_id, user_email, user_phone, stars, description
//       ) VALUES (?, ?, ?, ?, ?)`,
//       [
//         review.training_id,
//         review.user_email,
//         review.user_phone,
//         review.stars,
//         review.description || null
//       ],
//       function(err) {
//         if (err) {
//           return callback(err, null);
//         }
//         // Use `this.lastID` instead of `result.lastID`
//         callback(null, { lastID: this.lastID });
//       }
//     );
//   },

//   getByTraining: (trainingId, callback) => {
//     db.all('SELECT * FROM reviews WHERE training_id = ? ORDER BY created_at DESC', [trainingId], callback);
//   },

//   getAverageRating: (trainingId, callback) => {
//     db.get(
//       'SELECT AVG(stars) as average_rating, COUNT(*) as review_count FROM reviews WHERE training_id = ?',
//       [trainingId],
//       callback
//     );
//   },

//   update: (id, updatedReview, callback) => {
//     db.run(
//       `UPDATE reviews 
//        SET stars = ?, description = ? 
//        WHERE id = ?`,
//       [
//         updatedReview.stars,
//         updatedReview.description || null,
//         id
//       ],
//       callback
//     );
//   },

//   delete: (id, callback) => {
//     db.run('DELETE FROM reviews WHERE id = ?', [id], callback);
//   },

//   validateReview: (review) => {
//     const errors = [];

//     if (!review.training_id) {
//       errors.push('Training ID is required');
//     }

//     if (!review.user_email) {
//       errors.push('User email is required');
//     }

//     if (!review.user_phone) {
//       errors.push('User phone is required');
//     }

//     if (!review.stars || review.stars < 1 || review.stars > 5) {
//       errors.push('Stars must be between 1 and 5');
//     }

//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }
// };

// module.exports = { Review };

const prisma = require('../prisma/prismaClient');

const Review = {
  // Method to create a new review
  createReview: async (reviewData) => {
    const { stars } = reviewData;

    // Validate the stars value before proceeding
    if (stars < 1 || stars > 5) {
      throw new Error('Stars must be between 1 and 5');
    }

    try {
      // Create the review in the database
      const review = await prisma.review.create({
        data: reviewData
      });
      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error(error.message);  // Throw an error to propagate it to the controller
    }
  },

  // Method to fetch reviews by training ID
  getByTraining: async (trainingId) => {
    try {
      // Fetch all reviews for a specific training, ordered by the most recent
      const reviews = await prisma.review.findMany({
        where: { training_id: parseInt(trainingId) },
        orderBy: { created_at: 'desc' }
      });
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error(error.message);  // Throw an error to propagate it to the controller
    }
  },

  // Method to calculate the average rating for a specific training
  getAverageRating: async (trainingId) => {
    try {
      // Aggregate to calculate average stars and count
      const result = await prisma.review.aggregate({
        where: { training_id: parseInt(trainingId) },
        _avg: { stars: true },
        _count: { stars: true }
      });

      return {
        average_rating: result._avg.stars || 0,
        review_count: result._count.stars || 0
      };
    } catch (error) {
      console.error('Error calculating average rating:', error);
      throw new Error(error.message);  // Throw an error to propagate it to the controller
    }
  },

  // Method to update a review
  updateReview: async (id, updatedReview) => {
    try {
      const updated = await prisma.review.update({
        where: { id: parseInt(id) },
        data: updatedReview
      });
      return updated;
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error(error.message);
    }
  },

  // Method to delete a review
  deleteReview: async (id) => {
    try {
      const deleted = await prisma.review.delete({
        where: { id: parseInt(id) }
      });
      return deleted;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error(error.message);
    }
  },

  // Helper function to validate review data (check for missing fields and invalid stars)
  validateReview: (review) => {
    const errors = [];

    if (!review.training_id) {
      errors.push('Training ID is required');
    }

    if (!review.user_email) {
      errors.push('User email is required');
    }

    if (!review.user_phone) {
      errors.push('User phone is required');
    }

    if (!review.stars || review.stars < 1 || review.stars > 5) {
      errors.push('Stars must be between 1 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = { Review };
