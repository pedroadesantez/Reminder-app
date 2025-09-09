const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

const prisma = new PrismaClient();

const reminderSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().max(500).allow(''),
  scheduledAt: Joi.date().iso().min('now').required(),
  type: Joi.string().valid('PUSH', 'EMAIL', 'SMS').default('PUSH'),
  recurring: Joi.boolean().default(false),
  recurringPattern: Joi.string().max(50).allow(''),
  taskId: Joi.string().allow(null)
});

const getAllReminders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      triggered, 
      type, 
      upcoming = false,
      taskId,
      sortBy = 'scheduledAt', 
      sortOrder = 'asc'
    } = req.query;

    const where = {
      userId: req.user.id
    };

    if (triggered !== undefined) {
      where.triggered = triggered === 'true';
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    if (taskId) {
      where.taskId = taskId;
    }

    if (upcoming === 'true') {
      where.scheduledAt = { gte: new Date() };
      where.triggered = false;
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder.toLowerCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        include: {
          task: {
            select: { id: true, title: true, completed: true }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.reminder.count({ where })
    ]);

    res.json({
      reminders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};

const getReminderById = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        task: {
          select: { id: true, title: true, description: true, completed: true }
        }
      }
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ reminder });

  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ error: 'Failed to fetch reminder' });
  }
};

const createReminder = async (req, res) => {
  try {
    const { error, value } = reminderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // If taskId provided, verify task exists and belongs to user
    if (value.taskId) {
      const task = await prisma.task.findFirst({
        where: { id: value.taskId, userId: req.user.id }
      });
      
      if (!task) {
        return res.status(400).json({ error: 'Task not found' });
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        ...value,
        userId: req.user.id
      },
      include: {
        task: {
          select: { id: true, title: true, completed: true }
        }
      }
    });

    // Schedule the reminder (in a real app, you'd use a job queue)
    scheduleReminderNotification(reminder);

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('reminder_created', reminder);

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder
    });

  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
};

const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateSchema = reminderSchema.fork(['title', 'scheduledAt'], (schema) => schema.optional());
    
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingReminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: value,
      include: {
        task: {
          select: { id: true, title: true, completed: true }
        }
      }
    });

    // Reschedule if time changed
    if (value.scheduledAt) {
      scheduleReminderNotification(reminder);
    }

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('reminder_updated', reminder);

    res.json({
      message: 'Reminder updated successfully',
      reminder
    });

  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingReminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    await prisma.reminder.delete({
      where: { id }
    });

    // Cancel scheduled notification
    cancelReminderNotification(id);

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('reminder_deleted', { id });

    res.json({ message: 'Reminder deleted successfully' });

  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
};

const snoozeReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { minutes = 15 } = req.body;

    // Check if reminder exists and belongs to user
    const existingReminder = await prisma.reminder.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingReminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const newScheduledAt = new Date(Date.now() + minutes * 60 * 1000);

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        scheduledAt: newScheduledAt,
        snoozed: true,
        snoozeCount: existingReminder.snoozeCount + 1,
        triggered: false
      },
      include: {
        task: {
          select: { id: true, title: true, completed: true }
        }
      }
    });

    // Reschedule notification
    scheduleReminderNotification(reminder);

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('reminder_snoozed', reminder);

    res.json({
      message: `Reminder snoozed for ${minutes} minutes`,
      reminder
    });

  } catch (error) {
    console.error('Snooze reminder error:', error);
    res.status(500).json({ error: 'Failed to snooze reminder' });
  }
};

const markAsTriggered = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { triggered: true },
      include: {
        task: {
          select: { id: true, title: true, completed: true }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('socketio');
    io.to(`user_${req.user.id}`).emit('reminder_triggered', reminder);

    res.json({
      message: 'Reminder marked as triggered',
      reminder
    });

  } catch (error) {
    console.error('Mark reminder triggered error:', error);
    res.status(500).json({ error: 'Failed to mark reminder as triggered' });
  }
};

// Utility functions for scheduling (simplified for demo)
const scheduledJobs = new Map();

const scheduleReminderNotification = (reminder) => {
  const jobId = reminder.id;
  
  // Cancel existing job if any
  if (scheduledJobs.has(jobId)) {
    scheduledJobs.get(jobId).destroy();
  }

  const scheduledDate = new Date(reminder.scheduledAt);
  const now = new Date();
  
  if (scheduledDate <= now) {
    // Already passed, trigger immediately
    triggerReminder(reminder);
    return;
  }

  // Convert to cron format (simplified - in production use a proper job queue)
  const cronTime = `${scheduledDate.getMinutes()} ${scheduledDate.getHours()} ${scheduledDate.getDate()} ${scheduledDate.getMonth() + 1} *`;
  
  try {
    const job = cron.schedule(cronTime, () => {
      triggerReminder(reminder);
    }, {
      scheduled: false
    });
    
    job.start();
    scheduledJobs.set(jobId, job);
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
  }
};

const cancelReminderNotification = (reminderId) => {
  if (scheduledJobs.has(reminderId)) {
    scheduledJobs.get(reminderId).destroy();
    scheduledJobs.delete(reminderId);
  }
};

const triggerReminder = async (reminder) => {
  try {
    // Mark as triggered in database
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { triggered: true }
    });

    // Send notification (implement based on type)
    console.log(`Reminder triggered: ${reminder.title} for user ${reminder.userId}`);
    
    // You would implement actual push notifications, emails, etc. here
    
    // Handle recurring reminders
    if (reminder.recurring && reminder.recurringPattern) {
      // Create next occurrence (simplified implementation)
      const nextSchedule = calculateNextOccurrence(reminder.scheduledAt, reminder.recurringPattern);
      
      if (nextSchedule) {
        await prisma.reminder.create({
          data: {
            title: reminder.title,
            message: reminder.message,
            scheduledAt: nextSchedule,
            type: reminder.type,
            recurring: reminder.recurring,
            recurringPattern: reminder.recurringPattern,
            taskId: reminder.taskId,
            userId: reminder.userId
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error triggering reminder:', error);
  }
};

const calculateNextOccurrence = (currentDate, pattern) => {
  const date = new Date(currentDate);
  
  switch (pattern) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }
  
  return date;
};

module.exports = {
  getAllReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  snoozeReminder,
  markAsTriggered
};