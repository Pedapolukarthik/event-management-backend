// Quick test script to verify the registration endpoint is working
const axios = require('axios');

async function testRegistrationEndpoint() {
  console.log('Testing Registration Endpoint...\n');
  
  // First, get events to find a valid event ID
  try {
    console.log('1. Fetching events...');
    const eventsResponse = await axios.get('http://localhost:5000/api/events/all');
    const events = eventsResponse.data;
    
    if (events.length === 0) {
      console.log('❌ No events found. Please create an event first.');
      return;
    }
    
    const eventId = events[0].id;
    console.log(`✓ Found event: ${events[0].title} (ID: ${eventId})\n`);
    
    // Test registration
    console.log('2. Testing registration endpoint...');
    const testData = {
      username: 'teststudent',
      name: 'Test Student',
      email: 'test@univ.edu',
      department: 'CSE'
    };
    
    console.log(`   POST http://localhost:5000/api/events/${eventId}/register`);
    console.log(`   Body:`, testData);
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`,
        testData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('\n✅ SUCCESS! Registration endpoint is working!');
      console.log('Response:', response.data);
      
    } catch (error) {
      if (error.response) {
        console.log('\n❌ ERROR:');
        console.log('Status:', error.response.status);
        console.log('Message:', error.response.data);
        
        if (error.response.status === 404) {
          console.log('\n🔍 404 Error means the route is not found.');
          console.log('Possible causes:');
          console.log('1. Backend server needs to be restarted');
          console.log('2. Route not properly registered');
          console.log('3. Route order issue in eventRoutes.js');
        }
      } else {
        console.log('\n❌ Network Error:', error.message);
        console.log('Is the backend server running on port 5000?');
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch events:', error.message);
    console.log('Is the backend server running?');
  }
}

testRegistrationEndpoint();

