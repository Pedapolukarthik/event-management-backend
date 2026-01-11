// Database Setup Script
// This script will create the event table and add the time column if needed

const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('Starting database setup...\n');

  // Check if table exists
  db.query("SHOW TABLES LIKE 'event'", (err, results) => {
    if (err) {
      console.error('Error checking table:', err);
      db.end();
      return;
    }

    if (results.length > 0) {
      console.log('✓ Table "event" already exists');
      
      // Check if time column exists
      db.query("DESCRIBE event", (err, columns) => {
        if (err) {
          console.error('Error describing table:', err);
          db.end();
          return;
        }

        const hasTimeColumn = columns.some(col => col.Field === 'time');
        
        if (hasTimeColumn) {
          console.log('✓ Column "time" already exists');
          console.log('\nDatabase setup complete! Table structure:');
          db.query("DESCRIBE event", (err, cols) => {
            if (!err) {
              console.table(cols.map(col => ({
                Field: col.Field,
                Type: col.Type,
                Null: col.Null,
                Key: col.Key,
                Default: col.Default
              })));
            }
            db.end();
          });
        } else {
          console.log('⚠ Column "time" is missing. Adding it...');
          
          // Add time column (safer option without AFTER)
          db.query("ALTER TABLE event ADD COLUMN time TIME", (err, result) => {
            if (err) {
              console.error('✗ Error adding time column:', err.message);
              console.log('\nTrying alternative method...');
              
              // Try with AFTER clause
              db.query("ALTER TABLE event ADD COLUMN time TIME AFTER date", (err2, result2) => {
                if (err2) {
                  console.error('✗ Error with alternative method:', err2.message);
                  console.log('\nPlease manually add the time column using:');
                  console.log('ALTER TABLE event ADD COLUMN time TIME;');
                } else {
                  console.log('✓ Column "time" added successfully');
                }
                
                console.log('\nFinal table structure:');
                db.query("DESCRIBE event", (err3, cols) => {
                  if (!err3) {
                    console.table(cols.map(col => ({
                      Field: col.Field,
                      Type: col.Type,
                      Null: col.Null,
                      Key: col.Key,
                      Default: col.Default
                    })));
                  }
                  db.end();
                });
              });
            } else {
              console.log('✓ Column "time" added successfully');
              console.log('\nFinal table structure:');
              db.query("DESCRIBE event", (err3, cols) => {
                if (!err3) {
                  console.table(cols.map(col => ({
                    Field: col.Field,
                    Type: col.Type,
                    Null: col.Null,
                    Key: col.Key,
                    Default: col.Default
                  })));
                }
                db.end();
              });
            }
          });
        }
      });
    } else {
      console.log('⚠ Table "event" does not exist. Creating it...');
      
      // Create table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS event (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          time TIME,
          location VARCHAR(255),
          registration_link VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      db.query(createTableSQL, (err, result) => {
        if (err) {
          console.error('✗ Error creating table:', err.message);
          db.end();
          return;
        }
        
        console.log('✓ Table "event" created successfully');
        console.log('\nTable structure:');
        db.query("DESCRIBE event", (err2, cols) => {
          if (!err2) {
            console.table(cols.map(col => ({
              Field: col.Field,
              Type: col.Type,
              Null: col.Null,
              Key: col.Key,
              Default: col.Default
            })));
          }
          db.end();
        });
      });
    }
  });
}

// Run setup
setupDatabase();


