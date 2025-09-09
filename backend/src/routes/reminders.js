const express = require('express');
const router = express.Router();
const {
  getAllReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  snoozeReminder,
  markAsTriggered
} = require('../controllers/remindersController');

// GET /api/reminders - Get all reminders with filtering
router.get('/', getAllReminders);

// GET /api/reminders/:id - Get specific reminder
router.get('/:id', getReminderById);

// POST /api/reminders - Create new reminder
router.post('/', createReminder);

// PUT /api/reminders/:id - Update reminder
router.put('/:id', updateReminder);

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', deleteReminder);

// POST /api/reminders/:id/snooze - Snooze reminder
router.post('/:id/snooze', snoozeReminder);

// POST /api/reminders/:id/trigger - Mark reminder as triggered
router.post('/:id/trigger', markAsTriggered);

module.exports = router;