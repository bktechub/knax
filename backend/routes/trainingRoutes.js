// routes/trainingRoutes.js
const express = require('express');
const TrainingController = require('../controllers/TrainingController');

const router = express.Router();

router.post('/', TrainingController.createTraining);
router.get('/', TrainingController.getAllTrainings);
router.get('/:id', TrainingController.getTrainingById);
router.put('/:id', TrainingController.updateTraining);
router.delete('/:id', TrainingController.deleteTraining);
router.get('/category/:categoryId', TrainingController.getTrainingsByCategory);

module.exports = router;