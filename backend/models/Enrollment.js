// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('./traininginrwanda1.db');

// class Enrollment {
//   static createEnrollment(enrollmentData) {
//     return new Promise((resolve, reject) => {
//       const { fullname, email, phone, address, training_schedule_id } = enrollmentData;
//       const query = `
//         INSERT INTO enrollment 
//         (fullname, email, phone, address, training_schedule_id) 
//         VALUES (?, ?, ?, ?, ?)
//       `;
      
//       db.run(query, 
//         [fullname, email, phone, address, training_schedule_id], 
//         function(err) {
//           if (err) {
//             reject(err);
//           } else {
//             resolve({ id: this.lastID });
//           }
//         }
//       );
//     });
//   }

//   static getAllEnrollments() {
//     return new Promise((resolve, reject) => {
//       db.all(`
//         SELECT e.*, ts.start_date, ts.end_date, t.title as training_title 
//         FROM enrollment e
//         JOIN training_schedules ts ON e.training_schedule_id = ts.id
//         JOIN trainings t ON ts.training_id = t.id
//       `, [], (err, rows) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(rows);
//         }
//       });
//     });
//   }

//   static getEnrollmentById(id) {
//     return new Promise((resolve, reject) => {
//       db.get(`
//         SELECT e.*, ts.start_date, ts.end_date, t.title as training_title 
//         FROM enrollment e
//         JOIN training_schedules ts ON e.training_schedule_id = ts.id
//         JOIN trainings t ON ts.training_id = t.id
//         WHERE e.id = ?
//       `, [id], (err, row) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(row);
//         }
//       });
//     });
//   }

//   static updateEnrollmentStatus(id, status) {
//     return new Promise((resolve, reject) => {
//       db.run(`
//         UPDATE enrollment
//         SET status = ? 
//         WHERE id = ?
//       `, [status, id], (err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve({ message: 'Enrollment status updated' });
//         }
//       });
//     });
//   }
// }

// module.exports = Enrollment;

const prisma = require('./../prisma/prismaClient');

class Enrollment {
  static async createEnrollment(enrollmentData) {
    try {
      // Ensure data integrity and type conversion
      const processedData = {
        ...enrollmentData,
        training_schedule_id: parseInt(enrollmentData.training_schedule_id),
        // Add any additional data processing or validation here
      };

      return await prisma.enrollment.create({
        data: processedData,
        include: {
          training_schedule: {
            include: {
              training: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating enrollment:', error);
      
      // More detailed error handling
      if (error.code === 'P2002') {
        throw new Error('An enrollment with these details already exists');
      }
      if (error.code === 'P2003') {
        throw new Error('Invalid foreign key reference');
      }
      
      throw error;
    }
  }

  static async getAllEnrollments() {
    try {
      const enrollments = await prisma.enrollment.findMany({
        include: {
          training_schedule: {
            include: {
              training: true
            }
          }
        },
        orderBy: {
          enrollment_date: 'desc' // Optional: sort by most recent first
        }
      });

      // Optional: Transform data if needed
      return enrollments.map(enrollment => ({
        ...enrollment,
        // Add any additional transformations
      }));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  }

  static async getEnrollmentById(id) {
    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: parseInt(id) },
        include: {
          training_schedule: {
            include: {
              training: true
            }
          }
        }
      });

      if (!enrollment) {
        throw new Error(`Enrollment with ID ${id} not found`);
      }

      return enrollment;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      throw error;
    }
  }

  static async updateEnrollmentStatus(id, status) {
    try {
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: parseInt(id) },
        data: { 
          status,
          updated_at: new Date() // Automatically update timestamp
        },
        include: {
          training_schedule: {
            include: {
              training: true
            }
          }
        }
      });

      return {
        message: 'Enrollment status updated successfully',
        enrollment: updatedEnrollment
      };
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      
      if (error.code === 'P2025') {
        throw new Error(`Enrollment with ID ${id} not found`);
      }
      
      throw error;
    }
  }

  // Optional: Additional methods you might want
  static async getEnrollmentsByTrainingSchedule(trainingScheduleId) {
    try {
      return await prisma.enrollment.findMany({
        where: { 
          training_schedule_id: parseInt(trainingScheduleId) 
        },
        include: {
          training_schedule: {
            include: {
              training: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching enrollments by training schedule:', error);
      throw error;
    }
  }

  static async deleteEnrollment(id) {
    try {
      await prisma.enrollment.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Enrollment deleted successfully' };
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      
      if (error.code === 'P2025') {
        throw new Error(`Enrollment with ID ${id} not found`);
      }
      
      throw error;
    }
  }
}

module.exports = Enrollment;