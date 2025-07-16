#!/usr/bin/env node

/**
 * Test script to verify the API endpoint works
 * This can be used to test both local and deployed endpoints
 */

import fetch from 'node-fetch';

// Configuration
const API_URL = process.argv[2] || 'http://localhost:3001/api/ai-tutor';
const TEST_PROMPT = 'I need help with math';

async function testAPIEndpoint() {
  console.log('🧪 Testing API endpoint...');
  console.log('📍 URL:', API_URL);
  console.log('📝 Test prompt:', TEST_PROMPT);
  console.log('---');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: TEST_PROMPT,
        conversationState: null
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:');
      console.log(errorText);
    }

  } catch (error) {
    console.error('💥 Network error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Tip: Make sure the URL is correct and the server is running');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: The server is not running or not accessible');
    }
  }
}

// Run the test
testAPIEndpoint(); 