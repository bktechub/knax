const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected Routes for Admins
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;