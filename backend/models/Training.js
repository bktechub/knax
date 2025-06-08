const prisma = require('./../prisma/prismaClient');
const Decimal = require('decimal.js');

const Training = {
  // create: async (training) => {
  //   try {
  //     // Calculate discounted fee if discount percentage is provided
  //     let originalFee = training.fee ? new Decimal(training.fee) : null;
  //     let discountedFee = originalFee;
  //     let discountPercentage = null;

  //     if (training.discount_percentage && originalFee) {
  //       discountPercentage = Number(training.discount_percentage);
  //       const discountMultiplier = (100 - discountPercentage) / 100;
  //       discountedFee = originalFee.times(discountMultiplier).toDecimalPlaces(2);
  //     }

  //     // Normalize what_you_will_learn to ensure it's a valid JSON array
  //     const whatYouWillLearn = Array.isArray(training.what_you_will_learn) 
  //       ? training.what_you_will_learn 
  //       : (training.what_you_will_learn ? [training.what_you_will_learn] : []);

  //     // Create the training with optional schedule
  //     const createdTraining = await prisma.training.create({
  //       data: {
  //         title: training.title,
  //         description: training.description,
  //         duration: training.duration ? Number(training.duration) : null,
  //         instructor: training.instructor,
  //         fee: discountedFee ? discountedFee.toString() : null,
  //         original_fee: originalFee ? originalFee.toString() : null,
  //         discount_percentage: discountPercentage,
  //         level: training.level,
  //         is_certified: training.is_certified,
  //         what_you_will_learn: JSON.stringify(whatYouWillLearn),
  //         address: training.address,
  //         category: training.category_id ? {
  //           connect: { id: parseInt(training.category_id) }
  //         } : undefined,
  //         start_date: training.start_date ? new Date(training.start_date) : null,
  //         end_date: training.end_date ? new Date(training.end_date) : null,
  //       },
  //     });

  //     // Create training schedules if provided
  //     if (training.schedules && Array.isArray(training.schedules)) {
  //       await Promise.all(training.schedules.map(schedule => 
  //         prisma.trainingSchedule.create({
  //           data: {
  //             training_id: createdTraining.id,
  //             day: schedule.day,
  //             start_time: schedule.start_time,
  //             end_time: schedule.end_time
  //           }
  //         })
  //       ));
  //     }

  //     return createdTraining;
  //   } catch (error) {
  //     console.error('Error creating training:', error);
  //     throw error;
  //   }
  // },

  create: async (training) => {
    try {
      // Calculate discounted fee if discount percentage is provided
      let originalFee = training.fee ? new Decimal(training.fee) : null;
      let discountedFee = originalFee;
      let discountPercentage = null;

      if (training.discount_percentage && originalFee) {
        discountPercentage = Number(training.discount_percentage);
        const discountMultiplier = (100 - discountPercentage) / 100;
        discountedFee = originalFee.times(discountMultiplier).toDecimalPlaces(2);
      }

      // Normalize what_you_will_learn to ensure it's a valid JSON array
      const whatYouWillLearn = Array.isArray(training.what_you_will_learn) 
        ? training.what_you_will_learn 
        : (training.what_you_will_learn ? [training.what_you_will_learn] : []);

      // Create the training with optional schedule
      const createdTraining = await prisma.training.create({
        data: {
          title: training.title,
          description: training.description,
          details: training.details, // Add the details field
          duration: training.duration ? Number(training.duration) : null,
          instructor: training.instructor,
          fee: discountedFee ? discountedFee.toString() : null,
          original_fee: originalFee ? originalFee.toString() : null,
          discount_percentage: discountPercentage,
          level: training.level,
          is_certified: training.is_certified,
          what_you_will_learn: JSON.stringify(whatYouWillLearn),
          address: training.address,
          category: training.category_id ? {
            connect: { id: parseInt(training.category_id) }
          } : undefined,
          start_date: training.start_date ? new Date(training.start_date) : null,
          end_date: training.end_date ? new Date(training.end_date) : null,
        },
      });

      // Create training schedules if provided
      if (training.schedules && Array.isArray(training.schedules)) {
        await Promise.all(training.schedules.map(schedule => 
          prisma.trainingSchedule.create({
            data: {
              training_id: createdTraining.id,
              day: schedule.day,
              start_time: schedule.start_time,
              end_time: schedule.end_time
            }
          })
        ));
      }

      return createdTraining;
    } catch (error) {
      console.error('Error creating training:', error);
      throw error;
    }
  },

  update: async (id, updatedTraining) => {
    try {
      // Exclude the `id` field from `updatedTraining`
      const { id: _, category_id, fee, discount_percentage, schedules, ...dataToUpdate } = updatedTraining;

    

      // Normalize what_you_will_learn to ensure it's a valid JSON array
      const whatYouWillLearn = Array.isArray(dataToUpdate.what_you_will_learn) 
        ? dataToUpdate.what_you_will_learn 
        : (dataToUpdate.what_you_will_learn ? [dataToUpdate.what_you_will_learn] : []);

      // Update the training
      const updatedTrainingRecord = await prisma.training.update({
        where: {
          id: parseInt(id), // Ensure `id` is an integer
        },
        data: {
          ...dataToUpdate, 
          what_you_will_learn: JSON.stringify(whatYouWillLearn),
          category: category_id
            ? {
                connect: { id: parseInt(category_id) }, // Use `connect` for the relational field
              }
            : undefined, // Skip `category` if `category_id` is not provided
        },
      });

      // Update training schedules if provided
      if (schedules && Array.isArray(schedules)) {
        // First, delete existing schedules
        await prisma.trainingSchedule.deleteMany({
          where: { training_id: parseInt(id) }
        });

        // Then create new schedules
        await Promise.all(schedules.map(schedule => 
          prisma.trainingSchedule.create({
            data: {
              training_id: parseInt(id),
              day: schedule.day,
              start_time: schedule.start_time,
              end_time: schedule.end_time
            }
          })
        ));
      }

      return updatedTrainingRecord;
    } catch (error) {
      console.error('Error updating training:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const trainings = await prisma.training.findMany({
        include: { category: true },
      });
  
      return trainings.map((training) => {
        let parsedWhatYouWillLearn = [];
        if (training.what_you_will_learn) {
          try {
            // Attempt to parse `what_you_will_learn`
            parsedWhatYouWillLearn = JSON.parse(training.what_you_will_learn);
          } catch (parseError) {
            console.error(
              `Failed to parse 'what_you_will_learn' for training ID ${training.id}:`,
              parseError
            );
            // If parsing fails, create an array with the original string
            parsedWhatYouWillLearn = [training.what_you_will_learn];
          }
        }
  
        return {
          ...training,
          what_you_will_learn: parsedWhatYouWillLearn,
        };
      });
    } catch (error) {
      console.error('Error fetching trainings:', error);
      throw error;
    }
  },  

  getById: async (id) => {
    try {
      const training = await prisma.training.findUnique({
        where: { id: parseInt(id) },
        include: { 
          category: true
        },
      });

      if (training) {
        let parsedWhatYouWillLearn = [];
        if (training.what_you_will_learn) {
          try {
            parsedWhatYouWillLearn = JSON.parse(training.what_you_will_learn);
          } catch (parseError) {
            console.error(
              `Failed to parse 'what_you_will_learn' for training ID ${training.id}:`,
              parseError
            );
            parsedWhatYouWillLearn = [training.what_you_will_learn];
          }
        }

        return {
          ...training,
          what_you_will_learn: parsedWhatYouWillLearn,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching training:', error);
      throw error;
    }
  },

  getByCategory: async (categoryId) => {
    try {
      const trainings = await prisma.training.findMany({
        where: { category_id: parseInt(categoryId) },
        include: { category: true },
      });

      return trainings.map((training) => {
        let parsedWhatYouWillLearn = [];
        if (training.what_you_will_learn) {
          try {
            parsedWhatYouWillLearn = JSON.parse(training.what_you_will_learn);
          } catch (parseError) {
            console.error(
              `Failed to parse 'what_you_will_learn' for training ID ${training.id}:`,
              parseError
            );
            parsedWhatYouWillLearn = [training.what_you_will_learn];
          }
        }

        return {
          ...training,
          what_you_will_learn: parsedWhatYouWillLearn,
        };
      });
    } catch (error) {
      console.error('Error fetching trainings by category:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      // Delete related training schedules
      await prisma.trainingSchedule.deleteMany({
        where: { training_id: parseInt(id) },
      });

      // Delete related reviews
      await prisma.review.deleteMany({
        where: { training_id: parseInt(id) },
      });

      // Delete the training itself
      return await prisma.training.delete({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      console.error('Error deleting training:', error);
      throw error;
    }
  },
};

module.exports = { Training };
