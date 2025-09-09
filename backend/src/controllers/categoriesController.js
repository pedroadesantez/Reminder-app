const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#4A90E2'),
  icon: Joi.string().max(50).allow('')
});

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            completed: true,
            priority: true,
            dueDate: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await prisma.category.create({
      data: {
        ...value,
        userId: req.user.id
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('category_created', category);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = categorySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: value,
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('category_updated', category);

    res.json({
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete category (this will set categoryId to null for related tasks due to SetNull)
    await prisma.category.delete({
      where: { id }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('category_deleted', { id });

    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};