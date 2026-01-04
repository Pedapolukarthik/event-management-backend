// backend/routes/eventRoutes.js

const express = require('express');
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventRegistrations,
  getAllStudents
} = require('../controllers/eventController');

// Create event
router.post('/create', createEvent);

// Get all events
router.get('/all', getAllEvents);

// Get all students (for admin) - MUST be before dynamic routes
router.get('/students/all', getAllStudents);

// Update event
router.put('/update/:id', updateEvent);

// Delete event
router.delete('/delete/:id', deleteEvent);

// Register student for event
router.post('/:eventId/register', registerForEvent);

// Get registered students for an event
router.get('/:eventId/registrations', getEventRegistrations);

module.exports = router;
