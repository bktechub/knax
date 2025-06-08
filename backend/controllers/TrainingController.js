const { Training } = require('../models/Training');

const TrainingController = {
  createTraining: async (req, res) => {
    try {
      const training = req.body;
  
      // Validate category_id if needed
      if (!training.category_id) {
        return res.status(400).json({ error: 'Category ID is required' });
      }
  
      // Ensure fee is a string that can be converted to a number
      if (training.fee) {
        training.fee = training.fee.toString().replace(/[^0-9.-]+/g,"");
      }
  
      const createdTraining = await Training.create(training);
      res.status(201).json({
        message: 'Training created successfully',
        training: createdTraining 
      });
    } catch (error) {
      console.error('Training creation error:', error);
      res.status(500).json({ 
        error: 'Error creating training', 
        details: error.message 
      });
    }
  },

  getTrainingsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const trainings = await Training.getByCategory(categoryId);
      res.status(200).json(trainings);
    } catch (error) {
      console.error('Fetching trainings by category error:', error);
      res.status(500).json({ 
        error: 'Error fetching trainings', 
        details: error.message 
      });
    }
  },

  getAllTrainings: async (req, res) => {
    try {
      const trainings = await Training.getAll();
      res.status(200).json(trainings);
    } catch (error) {
      console.error('Fetching all trainings error:', error);
      res.status(500).json({ 
        error: 'Error fetching trainings', 
        details: error.message 
      });
    }
  },

  getTrainingById: async (req, res) => {
    try {
      const { id } = req.params;
      const training = await Training.getById(id);
      
      if (!training) {
        return res.status(404).json({ error: 'Training not found' });
      }
      
      res.status(200).json(training);
    } catch (error) {
      console.error('Fetching training by ID error:', error);
      res.status(500).json({ 
        error: 'Error fetching training', 
        details: error.message 
      });
    }
  },

  updateTraining: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTraining = req.body;
  
      const updated = await Training.update(id, updatedTraining);
  
      res.status(200).json({ message: 'Training updated successfully', training: updated });
    } catch (error) {
      console.error('Error updating training:', error);
      res.status(500).json({
        error: 'Error updating training',
        details: error.message,
      });
    }
  },
  

  deleteTraining: async (req, res) => {
    try {
      const { id } = req.params;
  
      // Call the delete method in the Training model
      await Training.delete(id);
  
      res.status(200).json({ message: 'Training deleted successfully' });
    } catch (error) {
      console.error('Delete training error:', error);
      res.status(500).json({
        error: 'Error deleting training',
        details: error.message,
      });
    }
  }  
};

module.exports = TrainingController;