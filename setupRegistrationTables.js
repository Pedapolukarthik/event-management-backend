// Database Setup Script for Event Registration System
// Creates students and event_registrations tables

const db = require('./config/db');

async function setupRegistrationTables() {
  console.log('Setting up Event Registration tables...\n');

  // 1. Create students table
  const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255),
      email VARCHAR(255),
      department VARCHAR(100),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  db.query(createStudentsTable, (err) => {
    if (err) {
      console.error('✗ Error creating students table:', err.message);
      db.end();
      return;
    }
    console.log('✓ Students table created/verified\n');

    // 2. Create event_registrations table
    const createRegistrationsTable = `
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        student_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_registration (event_id, student_id)
      )
    `;

    db.query(createRegistrationsTable, (err) => {
      if (err) {
        console.error('✗ Error creating event_registrations table:', err.message);
        console.log('\nNote: If foreign key constraint fails, ensure event table exists first.');
        db.end();
        return;
      }
      console.log('✓ Event registrations table created/verified\n');

      // 3. Show table structures
      console.log('Table structures:');
      db.query('DESCRIBE students', (err, studentsCols) => {
        if (!err) {
          console.log('\nStudents table:');
          console.table(studentsCols.map(col => ({
            Field: col.Field,
            Type: col.Type,
            Null: col.Null,
            Key: col.Key
          })));
        }

        db.query('DESCRIBE event_registrations', (err2, regCols) => {
          if (!err2) {
            console.log('\nEvent Registrations table:');
            console.table(regCols.map(col => ({
              Field: col.Field,
              Type: col.Type,
              Null: col.Null,
              Key: col.Key
            })));
          }

          console.log('\n✅ Registration tables setup complete!');
          db.end();
        });
      });
    });
  });
}

setupRegistrationTables();




