import fetch from 'node-fetch';

async function testVercelAPI() {
  console.log('🧪 Testing Vercel API endpoint...');
  
  try {
    // Test the local development server first
    const localResponse = await fetch('http://localhost:3001/api/ai-tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Hello, I need help with math',
        conversationState: { step: 0 }
      })
    });
    
    console.log('📍 Local server response status:', localResponse.status);
    
    if (localResponse.ok) {
      const localData = await localResponse.json();
      console.log('✅ Local server working:', localData.type || 'success');
    } else {
      console.log('❌ Local server error:', localResponse.statusText);
    }
    
  } catch (error) {
    console.log('❌ Local server not running or error:', error.message);
  }
  
  // Test the Vercel deployment (replace with your actual Vercel URL)
  const vercelUrl = process.env.VERCEL_URL || 'https://your-app.vercel.app';
  
  try {
    const vercelResponse = await fetch(`${vercelUrl}/api/ai-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Hello, I need help with math',
        conversationState: { step: 0 }
      })
    });
    
    console.log('🌐 Vercel response status:', vercelResponse.status);
    
    if (vercelResponse.ok) {
      const vercelData = await vercelResponse.json();
      console.log('✅ Vercel deployment working:', vercelData.type || 'success');
    } else {
      const errorText = await vercelResponse.text();
      console.log('❌ Vercel deployment error:', vercelResponse.statusText);
      console.log('❌ Error details:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Vercel deployment error:', error.message);
  }
}

testVercelAPI(); 