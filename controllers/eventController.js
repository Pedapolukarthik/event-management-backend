const db = require('../config/db');

/* ===============================
   CREATE EVENT (Admin)
================================ */
exports.createEvent = (req, res) => {
  const { title, description, date, time, location, registration_link } = req.body;

  // Validation
  if (!title || !date) {
    return res.status(400).json({ 
      message: 'Title and date are required fields' 
    });
  }

  const sql = `
    INSERT INTO event (title, description, date, time, location, registration_link)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, date, time || null, location || null, registration_link || null],
    (err, result) => {
      if (err) {
        console.error('Event creation error:', err);
        // Return detailed error message for debugging
        return res.status(500).json({ 
          message: 'Failed to create event',
          error: err.message,
          sqlError: err.sqlMessage || err.code
        });
      }

      res.status(201).json({
        message: 'Event created successfully',
        eventId: result.insertId
      });
    }
  );
};


/* ===============================
   GET ALL EVENTS (Student/Admin)
================================ */
exports.getAllEvents = (req, res) => {
  const sql = `SELECT * FROM event ORDER BY date ASC, time ASC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch events error:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch events',
        error: err.message 
      });
    }

    res.status(200).json(results);
  });
};


/* ===============================
   UPDATE EVENT (Admin)
================================ */
exports.updateEvent = (req, res) => {
  const eventId = req.params.id;
  const { title, description, date, time, location, registration_link } = req.body;

  if (!title || !date) {
    return res.status(400).json({ 
      message: 'Title and date are required fields' 
    });
  }

  const sql = `
    UPDATE event
    SET title = ?, description = ?, date = ?, time = ?, location = ?, registration_link = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [title, description, date, time || null, location || null, registration_link || null, eventId],
    (err, result) => {
      if (err) {
        console.error('Event update error:', err);
        return res.status(500).json({ 
          message: 'Failed to update event',
          error: err.message 
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(200).json({ message: 'Event updated successfully' });
    }
  );
};


/* ===============================
   DELETE EVENT (Admin)
================================ */
exports.deleteEvent = (req, res) => {
  const eventId = req.params.id;

  const sql = `DELETE FROM event WHERE id = ?`;

  db.query(sql, [eventId], (err, result) => {
    if (err) {
      console.error('Event deletion error:', err);
      return res.status(500).json({ 
        message: 'Failed to delete event',
        error: err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  });
};


/* ===============================
   REGISTER STUDENT FOR EVENT
================================ */
exports.registerForEvent = (req, res) => {
  const eventId = req.params.eventId;
  const { student_id, username, name, email, department } = req.body;

  // Validation
  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  if (!student_id && !username) {
    return res.status(400).json({ message: 'Student ID or username is required' });
  }

  // First, ensure student exists in students table
  const getOrCreateStudent = (callback) => {
    if (student_id) {
      // If student_id provided, use it
      db.query('SELECT * FROM students WHERE id = ?', [student_id], (err, results) => {
        if (err) return callback(err);
        if (results.length > 0) {
          callback(null, results[0].id);
        } else {
          callback(new Error('Student not found'));
        }
      });
    } else {
      // If username provided, find or create student
      db.query('SELECT * FROM students WHERE username = ?', [username], (err, results) => {
        if (err) return callback(err);
        
        if (results.length > 0) {
          callback(null, results[0].id);
        } else {
          // Create new student record
          const insertStudent = `
            INSERT INTO students (username, name, email, department, status)
            VALUES (?, ?, ?, ?, 'active')
          `;
          db.query(insertStudent, [username, name || username, email || null, department || null], (err, result) => {
            if (err) return callback(err);
            callback(null, result.insertId);
          });
        }
      });
    }
  };

  getOrCreateStudent((err, studentId) => {
    if (err) {
      console.error('Student lookup/creation error:', err);
      return res.status(500).json({ 
        message: 'Failed to process student information',
        error: err.message 
      });
    }

    // Log for debugging
    console.log(`Registration attempt - Event ID: ${eventId}, Student ID: ${studentId}, Username: ${username || 'N/A'}`);

    // Check if already registered - IMPORTANT: Checks BOTH event_id AND student_id
    const checkRegistration = `SELECT * FROM event_registrations WHERE event_id = ? AND student_id = ?`;
    db.query(checkRegistration, [eventId, studentId], (err, results) => {
      if (err) {
        console.error('Registration check error:', err);
        return res.status(500).json({ 
          message: 'Failed to check registration',
          error: err.message 
        });
      }

      if (results.length > 0) {
        console.log(`Duplicate registration blocked - Event ID: ${eventId}, Student ID: ${studentId}`);
        return res.status(400).json({ 
          message: 'You are already registered for this event',
          eventId: eventId,
          studentId: studentId
        });
      }

      // Register student for event
      const registerSQL = `
        INSERT INTO event_registrations (event_id, student_id)
        VALUES (?, ?)
      `;

      db.query(registerSQL, [eventId, studentId], (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          return res.status(500).json({ 
            message: 'Failed to register for event',
            error: err.message,
            sqlError: err.sqlMessage || err.code
          });
        }

        res.status(201).json({
          message: 'Successfully registered for event',
          registrationId: result.insertId
        });
      });
    });
  });
};


/* ===============================
   GET REGISTERED STUDENTS FOR EVENT
================================ */
exports.getEventRegistrations = (req, res) => {
  const eventId = req.params.eventId;

  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  // SQL JOIN query to get event details with registered students
  const sql = `
    SELECT 
      er.id as registration_id,
      er.registered_at,
      s.id as student_id,
      s.username,
      s.name,
      s.email,
      s.department,
      s.status as student_status,
      e.id as event_id,
      e.title as event_title,
      e.date as event_date,
      e.location as event_location
    FROM event_registrations er
    INNER JOIN students s ON er.student_id = s.id
    INNER JOIN event e ON er.event_id = e.id
    WHERE er.event_id = ?
    ORDER BY er.registered_at DESC
  `;

  db.query(sql, [eventId], (err, results) => {
    if (err) {
      console.error('Fetch registrations error:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch registrations',
        error: err.message 
      });
    }

    res.status(200).json({
      eventId: parseInt(eventId),
      registrations: results,
      count: results.length
    });
  });
};


/* ===============================
   GET ALL STUDENTS (For Admin)
================================ */
exports.getAllStudents = (req, res) => {
  const sql = `SELECT * FROM students ORDER BY name ASC, created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch students error:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch students',
        error: err.message 
      });
    }

    res.status(200).json(results);
  });
};
