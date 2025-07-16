const axios = require('axios');

// Test the AI Tutor API locally
async function testAITutorLocal() {
  const API_URL = 'http://localhost:3001/api/ai-tutor';
  
  console.log('🧪 Testing AI Tutor API Locally');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Language selection
    console.log('\n📝 Test 1: Language Selection');
    const response1 = await axios.post(API_URL, {
      prompt: 'English',
      conversationState: null
    });
    
    console.log('✅ Response:', response1.data.response);
    console.log('🔄 Type:', response1.data.type);
    
    // Test 2: Subject detection
    console.log('\n📝 Test 2: Subject Detection');
    const response2 = await axios.post(API_URL, {
      prompt: 'math',
      conversationState: response1.data.conversationState
    });
    
    console.log('✅ Response:', response2.data.response);
    console.log('🔄 Type:', response2.data.type);
    console.log('📊 Subject:', response2.data.conversationState.subject);
    
    // Test 3: Time slots
    console.log('\n📝 Test 3: Time Slots');
    const response3 = await axios.post(API_URL, {
      prompt: '17:00',
      conversationState: response2.data.conversationState
    });
    
    console.log('✅ Response:', response3.data.response);
    console.log('🔄 Type:', response3.data.type);
    console.log('📊 Time slots:', response3.data.conversationState.timeSlots);
    
    // Test 4: Language preference
    console.log('\n📝 Test 4: Language Preference');
    const response4 = await axios.post(API_URL, {
      prompt: 'English',
      conversationState: response3.data.conversationState
    });
    
    console.log('✅ Response:', response4.data.response);
    console.log('🔄 Type:', response4.data.type);
    console.log('📊 Languages:', response4.data.conversationState.languages);
    
    // Test 5: Hobbies and tutor matching
    console.log('\n📝 Test 5: Hobbies and Tutor Matching');
    const response5 = await axios.post(API_URL, {
      prompt: 'I like chess and programming',
      conversationState: response4.data.conversationState
    });
    
    console.log('✅ Response:', response5.data.response);
    console.log('🔄 Type:', response5.data.type);
    
    if (response5.data.tutors && response5.data.tutors.length > 0) {
      console.log(`🎓 Found ${response5.data.tutors.length} tutors:`);
      response5.data.tutors.forEach((tutor, index) => {
        console.log(`   ${index + 1}. ${tutor.name} (${tutor.subject}) - Score: ${tutor.score}`);
        console.log(`      Languages: ${tutor.languagesSpoken.join(', ')}`);
        console.log(`      Available: ${tutor.availableTime.join(', ')}`);
        console.log(`      Hobbies: ${tutor.hobbies.join(', ')}`);
        if (tutor.scoreBreakdown) {
          console.log(`      Score breakdown: Subject(${tutor.scoreBreakdown.subject}) + Time(${tutor.scoreBreakdown.time}) + Language(${tutor.scoreBreakdown.language}) + Hobbies(${tutor.scoreBreakdown.hobbies})`);
        }
      });
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 3001');
    }
  }
}

// Test Russian language flow
async function testRussianFlow() {
  const API_URL = 'http://localhost:3001/api/ai-tutor';
  
  console.log('\n🧪 Testing Russian Language Flow');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Russian language selection
    console.log('\n📝 Test 1: Russian Language Selection');
    const response1 = await axios.post(API_URL, {
      prompt: 'Russian',
      conversationState: null
    });
    
    console.log('✅ Response:', response1.data.response);
    
    // Test 2: Russian subject
    console.log('\n📝 Test 2: Russian Subject');
    const response2 = await axios.post(API_URL, {
      prompt: 'математика',
      conversationState: response1.data.conversationState
    });
    
    console.log('✅ Response:', response2.data.response);
    
    // Test 3: Russian time
    console.log('\n📝 Test 3: Russian Time');
    const response3 = await axios.post(API_URL, {
      prompt: '16:00',
      conversationState: response2.data.conversationState
    });
    
    console.log('✅ Response:', response3.data.response);
    
    // Test 4: Russian language preference
    console.log('\n📝 Test 4: Russian Language Preference');
    const response4 = await axios.post(API_URL, {
      prompt: 'русский',
      conversationState: response3.data.conversationState
    });
    
    console.log('✅ Response:', response4.data.response);
    
    // Test 5: Russian hobbies
    console.log('\n📝 Test 5: Russian Hobbies');
    const response5 = await axios.post(API_URL, {
      prompt: 'шахматы',
      conversationState: response4.data.conversationState
    });
    
    console.log('✅ Response:', response5.data.response);
    
    if (response5.data.tutors && response5.data.tutors.length > 0) {
      console.log(`🎓 Found ${response5.data.tutors.length} tutors:`);
      response5.data.tutors.forEach((tutor, index) => {
        console.log(`   ${index + 1}. ${tutor.name} (${tutor.subject}) - Score: ${tutor.score}`);
      });
    }
    
    console.log('\n🎉 Russian flow completed successfully!');
    
  } catch (error) {
    console.error('❌ Russian test failed:', error.response?.data || error.message);
  }
}

// Test error handling
async function testErrorHandling() {
  const API_URL = 'http://localhost:3001/api/ai-tutor';
  
  console.log('\n🧪 Testing Error Handling');
  console.log('=' .repeat(50));
  
  try {
    // Test invalid method
    console.log('\n📝 Test 1: Invalid HTTP Method');
    try {
      await axios.get(API_URL);
      console.log('❌ GET request should not be allowed');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ GET request properly rejected');
      } else {
        console.log('❌ Unexpected error for GET request');
      }
    }
    
    // Test missing message
    console.log('\n📝 Test 2: Missing Message');
    try {
      await axios.post(API_URL, {
        conversationState: null
      });
      console.log('❌ Missing message should be rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Missing message properly handled');
      } else {
        console.log('❌ Missing message not properly handled');
      }
    }
    
    console.log('\n🎉 Error handling tests completed!');
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
}

// Main test runner
async function runLocalTests() {
  console.log('🚀 Starting Local AI Tutor API Tests');
  console.log('=' .repeat(60));
  
  await testAITutorLocal();
  await testRussianFlow();
  await testErrorHandling();
  
  console.log('\n✅ All local tests completed!');
}

// Run if called directly
if (require.main === module) {
  runLocalTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  testAITutorLocal,
  testRussianFlow,
  testErrorHandling,
  runLocalTests
}; 