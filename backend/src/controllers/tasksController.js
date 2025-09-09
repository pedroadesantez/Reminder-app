const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  dueDate: Joi.date().iso().allow(null),
  estimatedTime: Joi.string().max(50).allow(''),
  tags: Joi.array().items(Joi.string().max(50)).default([]),
  categoryId: Joi.string().allow(null)
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(1000).allow(''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH'),
  dueDate: Joi.date().iso().allow(null),
  estimatedTime: Joi.string().max(50).allow(''),
  actualTime: Joi.string().max(50).allow(''),
  tags: Joi.array().items(Joi.string().max(50)),
  categoryId: Joi.string().allow(null),
  completed: Joi.boolean()
});

const getAllTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      completed, 
      priority, 
      categoryId, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search,
      dueFrom,
      dueTo
    } = req.query;

    // Build where clause
    const where = {
      userId: req.user.id
    };

    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    if (priority) {
      where.priority = priority.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dueFrom || dueTo) {
      where.dueDate = {};
      if (dueFrom) where.dueDate.gte = new Date(dueFrom);
      if (dueTo) where.dueDate.lte = new Date(dueTo);
    }

    // Build order clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder.toLowerCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, color: true, icon: true }
          },
          reminders: {
            select: { id: true, scheduledAt: true, triggered: true }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true }
        },
        reminders: {
          select: { 
            id: true, 
            title: true,
            scheduledAt: true, 
            triggered: true,
            recurring: true,
            type: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

const createTask = async (req, res) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const taskData = {
      ...value,
      userId: req.user.id
    };

    const task = await prisma.task.create({
      data: taskData,
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true }
        },
        reminders: {
          select: { id: true, scheduledAt: true, triggered: true }
        }
      }
    });

    // Update user's total tasks count
    await prisma.user.update({
      where: { id: req.user.id },
      data: { totalTasks: { increment: 1 } }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('task_created', task);

    res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateTaskSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Handle task completion
    const updateData = { ...value };
    if (value.completed !== undefined && value.completed !== existingTask.completed) {
      if (value.completed) {
        updateData.completedAt = new Date();
        // Update user stats
        await prisma.user.update({
          where: { id: req.user.id },
          data: { 
            completedTasks: { increment: 1 },
            totalPoints: { increment: 10 } // Award points for completion
          }
        });
      } else {
        updateData.completedAt = null;
        // Revert user stats
        await prisma.user.update({
          where: { id: req.user.id },
          data: { 
            completedTasks: { decrement: 1 },
            totalPoints: { decrement: 10 }
          }
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true }
        },
        reminders: {
          select: { id: true, scheduledAt: true, triggered: true }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('task_updated', task);

    res.json({
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete task (cascade will handle reminders)
    await prisma.task.delete({
      where: { id }
    });

    // Update user's total tasks count
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        totalTasks: { decrement: 1 },
        // Also decrement completed tasks if it was completed
        ...(existingTask.completed && { completedTasks: { decrement: 1 } })
      }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('task_deleted', { id });

    res.json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      weekTasks
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, completed: true } }),
      prisma.task.count({ where: { userId, completed: false } }),
      prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: { lt: new Date() }
        }
      }),
      prisma.task.count({
        where: {
          userId,
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.task.count({
        where: {
          userId,
          dueDate: {
            gte: new Date(),
            lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        todayTasks,
        weekTasks,
        completionRate: parseFloat(completionRate)
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};