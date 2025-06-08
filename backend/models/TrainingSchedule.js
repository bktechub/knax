const prisma = require('./../prisma/prismaClient');

const TrainingSchedule = {
    create: async (schedule) => {
        try {
          // Check if training_id is provided
          if (!schedule.training_id) {
            throw new Error('Training ID is missing');
          }
      
          // Convert start_date and end_date to Date objects and then to ISO 8601 strings
          const isoStartDate = new Date(schedule.start_date).toISOString();
          const isoEndDate = new Date(schedule.end_date).toISOString();
      
          // Ensure the dates are valid ISO strings
          if (isNaN(new Date(isoStartDate).getTime()) || isNaN(new Date(isoEndDate).getTime())) {
            throw new RangeError('Invalid date value');
          }
      
          // Log the training_id to check if it's correctly passed
          console.log('Creating training schedule with training_id:', schedule.training_id);
      
          // Create the training schedule in the database
          return await prisma.trainingSchedule.create({
            data: {
              start_date: isoStartDate,
              end_date: isoEndDate,
              training: {
                connect: { id: schedule.training_id } // Ensure training_id is provided
              }
            }
          });
        } catch (error) {
          console.error('Error creating training schedule:', error.message);
          throw error;
        }
      },      
      
  getAll: async () => {
    try {
      return await prisma.trainingSchedule.findMany({
        include: { training: true }
      });
    } catch (error) {
      console.error('Error fetching training schedules:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      return await prisma.trainingSchedule.findUnique({
        where: { id: parseInt(id) },
        include: { training: true }
      });
    } catch (error) {
      console.error('Error fetching training schedule:', error);
      throw error;
    }
  },

  update: async (id, updatedSchedule) => {
    try {
      return await prisma.trainingSchedule.update({
        where: { id: parseInt(id) },
        data: updatedSchedule
      });
    } catch (error) {
      console.error('Error updating training schedule:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await prisma.trainingSchedule.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error deleting training schedule:', error);
      throw error;
    }
  },

  getByTraining: async (trainingId) => {
    try {
      return await prisma.trainingSchedule.findMany({
        where: { training_id: parseInt(trainingId) }
      });
    } catch (error) {
      console.error('Error fetching training schedules by training:', error);
      throw error;
    }
  }
};

module.exports = { TrainingSchedule };