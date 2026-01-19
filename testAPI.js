// Test script to verify the API endpoint is working
const axios = require('axios');

const testEvent = {
  title: 'Test Event',
  description: 'This is a test event',
  date: '2024-12-25',
  time: '10:00:00',
  location: 'Test Location',
  registration_link: 'https://example.com'
};

async function testCreateEvent() {
  try {
    console.log('Testing API endpoint: http://localhost:5000/api/events/create');
    console.log('Sending data:', testEvent);
    
    const response = await axios.post(
      'http://localhost:5000/api/events/create',
      testEvent,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✓ Success! Response:', response.data);
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.request) {
      console.error('No response received. Is the backend server running?');
    }
  }
}

testCreateEvent();




