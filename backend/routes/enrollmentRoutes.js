// routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/enrollmentController');

// Create a new enrollment
router.post('/', EnrollmentController.createEnrollment);

// Get all enrollments
router.get('/', EnrollmentController.getAllEnrollments);

// Get enrollment by ID
router.get('/:id', EnrollmentController.getEnrollmentById);

// Update enrollment status
router.patch('/:id/status', EnrollmentController.updateEnrollmentStatus);

module.exports = router;