// Simplified Vercel serverless function for AI Tutor (CommonJS)
module.exports = async function handler(req, res) {
  console.log('🚀 AI Tutor endpoint called');
  console.log('📝 Method:', req.method);
  console.log('🔑 OpenAI Key available:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { prompt, conversationState } = req.body;
    
    console.log('📨 Request body:', { prompt: prompt?.substring(0, 50) + '...', conversationState });
    
    if (!prompt || typeof prompt !== 'string') {
      console.log('❌ Invalid prompt:', prompt);
      return res.status(400).json({ error: 'Invalid prompt' });
    }
    
    // Simple response for testing
    const result = {
      type: 'needs_info',
      response: 'Hello! I can help you find a tutor. What subject do you need help with? (math, english, physics, chemistry, biology)',
      conversationState: { step: 1, subject: null, timeSlots: null, language: null, isTutorSearch: false }
    };
    
    console.log('✅ Response generated successfully');
    res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ Error in AI tutor endpoint:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      type: 'error',
      response: "I'm having trouble right now. Please try again.",
      conversationState: { step: 0, subject: null, timeSlots: null, language: null, isTutorSearch: false }
    });
  }
}; 