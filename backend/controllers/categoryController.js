const { Category } = require('../models/Category');

const CategoryController = {
  createCategory: async (req, res) => {
    try {
      const category = req.body;
      await Category.create(category);
      res.status(201).json({ message: 'Category created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating category' });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching categories' });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.getById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching category' });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCategory = req.body;
      await Category.update(id, updatedCategory);
      res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating category' });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      await Category.delete(id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting category' });
    }
  }
};

module.exports = CategoryController;