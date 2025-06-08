const { TrainingSchedule } = require('../models/TrainingSchedule');

const TrainingScheduleController = {
  createTrainingSchedule: async (req, res) => {
    try {
      const schedule = req.body;
      await TrainingSchedule.create(schedule);
      res.status(201).json({ message: 'Training schedule created successfully' });
    } catch (err) {
      console.error('Error creating training schedule:', err.message);
      res.status(500).json({ error: 'Error creating training schedule' });
    }
  },

  getAllTrainingSchedules: async (req, res) => {
    try {
      const schedules = await TrainingSchedule.getAll();
      res.status(200).json(schedules);
    } catch (err) {
      console.error('Error fetching training schedules:', err.message);
      res.status(500).json({ error: 'Error fetching training schedules' });
    }
  },

  getTrainingScheduleById: async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await TrainingSchedule.getById(id);
      if (!schedule) {
        return res.status(404).json({ error: 'Training schedule not found' });
      }
      res.status(200).json(schedule);
    } catch (err) {
      console.error('Error fetching training schedule:', err.message);
      res.status(500).json({ error: 'Error fetching training schedule' });
    }
  },

  updateTrainingSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSchedule = req.body;
      await TrainingSchedule.update(id, updatedSchedule);
      res.status(200).json({ message: 'Training schedule updated successfully' });
    } catch (err) {
      console.error('Error updating training schedule:', err.message);
      res.status(500).json({ error: 'Error updating training schedule' });
    }
  },

  deleteTrainingSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      await TrainingSchedule.delete(id);
      res.status(200).json({ message: 'Training schedule deleted successfully' });
    } catch (err) {
      console.error('Error deleting training schedule:', err.message);
      res.status(500).json({ error: 'Error deleting training schedule' });
    }
  },

  getSchedulesByTraining: async (req, res) => {
    try {
      const { trainingId } = req.params;
      const schedules = await TrainingSchedule.getByTraining(trainingId);
      if (!schedules || schedules.length === 0) {
        return res.status(404).json({ error: 'No schedules found for this training' });
      }
      res.status(200).json(schedules);
    } catch (err) {
      console.error('Error fetching training schedules by training:', err.message);
      res.status(500).json({ error: 'Error fetching training schedules by training' });
    }
  },
};

module.exports = TrainingScheduleController;
