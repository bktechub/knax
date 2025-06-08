const prisma = require('./../prisma/prismaClient');

const Category = {
  create: async (category) => {
    try {
      return await prisma.category.create({
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      return await prisma.category.findMany();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      return await prisma.category.findUnique({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  update: async (id, updatedCategory) => {
    try {
      return await prisma.category.update({
        where: { id: parseInt(id) },
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await prisma.category.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

module.exports = { Category };