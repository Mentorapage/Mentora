#!/usr/bin/env node

/**
 * Test script for the Vercel serverless function
 * This simulates a request to the /api/ai-tutor endpoint
 */

import handler from './api/ai-tutor.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock request and response objects
const mockRequest = {
  method: 'POST',
  body: {
    prompt: 'I need help with math',
    conversationState: null
  }
};

const mockResponse = {
  statusCode: 200,
  headers: {},
  body: null,
  
  status(code) {
    this.statusCode = code;
    return this;
  },
  
  json(data) {
    this.body = data;
    console.log('Response:', JSON.stringify(data, null, 2));
    return this;
  },
  
  setHeader(name, value) {
    this.headers[name] = value;
  }
};

// Test the function
async function testFunction() {
  console.log('🧪 Testing Vercel serverless function...');
  console.log('📝 Request:', JSON.stringify(mockRequest.body, null, 2));
  console.log('🔑 OpenAI Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
  console.log('---');
  
  try {
    await handler(mockRequest, mockResponse);
    
    if (mockResponse.statusCode === 200) {
      console.log('✅ Function test successful!');
      console.log('📊 Status Code:', mockResponse.statusCode);
    } else {
      console.log('❌ Function test failed!');
      console.log('📊 Status Code:', mockResponse.statusCode);
    }
  } catch (error) {
    console.error('💥 Function test error:', error);
  }
}

// Run the test
testFunction(); 