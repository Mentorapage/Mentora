import fetch from 'node-fetch';

async function testEndpoints() {
  const baseUrl = 'https://mentora-zeta.vercel.app';
  
  console.log('🧪 Testing Vercel endpoints...\n');
  
  // Test health endpoint
  console.log('1️⃣ Testing /api/health...');
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    console.log('   Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health endpoint working:', healthData.status);
      console.log('   Response:', healthData);
    } else {
      console.log('   ❌ Health endpoint failed:', healthResponse.statusText);
    }
  } catch (error) {
    console.log('   ❌ Health endpoint error:', error.message);
  }
  
  console.log('\n2️⃣ Testing /api/ai-tutor...');
  try {
    const aiResponse = await fetch(`${baseUrl}/api/ai-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Hello, I need help with math',
        conversationState: { step: 0 }
      })
    });
    
    console.log('   Status:', aiResponse.status);
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      console.log('   ✅ AI Tutor endpoint working:', aiData.type);
      console.log('   Response:', aiData);
    } else {
      const errorText = await aiResponse.text();
      console.log('   ❌ AI Tutor endpoint failed:', aiResponse.statusText);
      console.log('   Error details:', errorText);
    }
  } catch (error) {
    console.log('   ❌ AI Tutor endpoint error:', error.message);
  }
  
  console.log('\n3️⃣ Testing GET request to /api/ai-tutor (should fail)...');
  try {
    const getResponse = await fetch(`${baseUrl}/api/ai-tutor`);
    console.log('   Status:', getResponse.status);
    
    if (getResponse.status === 405) {
      console.log('   ✅ Correctly rejected GET request (Method Not Allowed)');
    } else {
      console.log('   ⚠️ Unexpected response for GET request');
    }
  } catch (error) {
    console.log('   ❌ GET request error:', error.message);
  }
}

testEndpoints(); 