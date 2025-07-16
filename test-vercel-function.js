// Test script for Vercel serverless functions
const http = require('http');

// Test health endpoint
function testHealth() {
  console.log('🧪 Testing /api/health...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    console.log('   Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('   ✅ Health endpoint working:', json.status);
        console.log('   Response:', json);
      } catch (e) {
        console.log('   ❌ Invalid JSON response:', data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log('   ❌ Health endpoint error:', err.message);
  });
  
  req.end();
}

// Test AI tutor endpoint
function testAITutor() {
  console.log('\n🧪 Testing /api/ai-tutor...');
  
  const postData = JSON.stringify({
    prompt: 'Hello, I need help with math',
    conversationState: { step: 0 }
  });
  
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/ai-tutor',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    console.log('   Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('   ✅ AI tutor endpoint working:', json.reply);
        console.log('   Response:', json);
      } catch (e) {
        console.log('   ❌ Invalid JSON response:', data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log('   ❌ AI tutor endpoint error:', err.message);
  });
  
  req.write(postData);
  req.end();
}

// Run tests
console.log('🚀 Testing Vercel serverless functions...\n');
testHealth();
setTimeout(testAITutor, 1000); 