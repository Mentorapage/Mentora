const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_ENDPOINT = `${API_BASE_URL}/api/ai-tutor`;

// Test scenarios
const testScenarios = [
  {
    name: "Complete English Tutor Search",
    steps: [
      { message: "English", expectedType: "needs_info" },
      { message: "english", expectedType: "needs_info" },
      { message: "17:00", expectedType: "needs_info" },
      { message: "English", expectedType: "needs_info" },
      { message: "I like writing and theater", expectedType: "tutor_matches" }
    ]
  },
  {
    name: "Complete Math Tutor Search",
    steps: [
      { message: "English", expectedType: "needs_info" },
      { message: "math", expectedType: "needs_info" },
      { message: "15:00", expectedType: "needs_info" },
      { message: "English", expectedType: "needs_info" },
      { message: "I enjoy chess and programming", expectedType: "tutor_matches" }
    ]
  },
  {
    name: "Complete Physics Tutor Search",
    steps: [
      { message: "English", expectedType: "needs_info" },
      { message: "physics", expectedType: "needs_info" },
      { message: "18:00", expectedType: "needs_info" },
      { message: "English", expectedType: "needs_info" },
      { message: "I love astronomy", expectedType: "tutor_matches" }
    ]
  },
  {
    name: "Russian Language Flow",
    steps: [
      { message: "Russian", expectedType: "needs_info" },
      { message: "математика", expectedType: "needs_info" },
      { message: "16:00", expectedType: "needs_info" },
      { message: "русский", expectedType: "needs_info" },
      { message: "шахматы", expectedType: "tutor_matches" }
    ]
  }
];

// Helper function to make API calls
async function makeAPICall(message, conversationState = null) {
  try {
    const response = await axios.post(API_ENDPOINT, {
      message,
      conversationState
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500,
      data: error.response?.data || null
    };
  }
}

// Test scoring verification
function verifyScoring(tutors, expectedSubject) {
  console.log('\n🎯 SCORING VERIFICATION:');
  
  for (const tutor of tutors) {
    console.log(`\n📊 ${tutor.name}:`);
    console.log(`   Subject: ${tutor.scoreBreakdown.subject}/9000 (${(tutor.scoreBreakdown.subject/9000*100).toFixed(1)}%)`);
    console.log(`   Time: ${tutor.scoreBreakdown.time}/900 (${(tutor.scoreBreakdown.time/900*100).toFixed(1)}%)`);
    console.log(`   Language: ${tutor.scoreBreakdown.language}/90 (${(tutor.scoreBreakdown.language/90*100).toFixed(1)}%)`);
    console.log(`   Hobbies: ${tutor.scoreBreakdown.hobbies}/10 (${(tutor.scoreBreakdown.hobbies/10*100).toFixed(1)}%)`);
    console.log(`   TOTAL: ${tutor.score}/10000 (${(tutor.score/10000*100).toFixed(1)}%)`);
    
    // Verify subject match
    if (tutor.subject !== expectedSubject) {
      console.log(`   ❌ SUBJECT MISMATCH: Expected ${expectedSubject}, got ${tutor.subject}`);
    } else {
      console.log(`   ✅ Subject matches correctly`);
    }
    
    // Verify scoring logic
    const expectedScore = tutor.scoreBreakdown.subject + tutor.scoreBreakdown.time + 
                         tutor.scoreBreakdown.language + tutor.scoreBreakdown.hobbies;
    if (tutor.score !== expectedScore) {
      console.log(`   ❌ SCORE CALCULATION ERROR: Expected ${expectedScore}, got ${tutor.score}`);
    } else {
      console.log(`   ✅ Score calculation correct`);
    }
  }
}

// Test conversation flow
async function testConversationFlow(scenario) {
  console.log(`\n🧪 TESTING: ${scenario.name}`);
  console.log('=' .repeat(50));
  
  let conversationState = null;
  
  for (let i = 0; i < scenario.steps.length; i++) {
    const step = scenario.steps[i];
    console.log(`\n📝 Step ${i + 1}: "${step.message}"`);
    
    const result = await makeAPICall(step.message, conversationState);
    
    if (!result.success) {
      console.log(`❌ API call failed: ${result.error}`);
      return false;
    }
    
    const { type, response, tutors, conversationState: newState } = result.data;
    
    console.log(`✅ Response type: ${type}`);
    console.log(`💬 Response: ${response}`);
    
    if (type === 'tutor_matches' && tutors) {
      console.log(`🎓 Found ${tutors.length} tutors`);
      tutors.forEach((tutor, index) => {
        console.log(`   ${index + 1}. ${tutor.name} (${tutor.subject}) - Score: ${tutor.score}`);
      });
      
      // Verify scoring for the first scenario
      if (scenario.name.includes("Math") || scenario.name.includes("математика")) {
        verifyScoring(tutors, 'math');
      } else if (scenario.name.includes("English")) {
        verifyScoring(tutors, 'english');
      } else if (scenario.name.includes("Physics")) {
        verifyScoring(tutors, 'physics');
      }
    }
    
    if (type !== step.expectedType) {
      console.log(`❌ Expected type ${step.expectedType}, got ${type}`);
      return false;
    }
    
    conversationState = newState;
  }
  
  console.log(`\n✅ ${scenario.name} completed successfully!`);
  return true;
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🧪 TESTING ERROR HANDLING');
  console.log('=' .repeat(50));
  
  // Test invalid method
  try {
    const response = await axios.get(API_ENDPOINT);
    console.log('❌ GET request should not be allowed');
    return false;
  } catch (error) {
    if (error.response?.status === 405) {
      console.log('✅ GET request properly rejected');
    } else {
      console.log('❌ Unexpected error for GET request');
      return false;
    }
  }
  
  // Test missing message
  const result = await makeAPICall('', null);
  if (result.status === 400) {
    console.log('✅ Missing message properly handled');
  } else {
    console.log('❌ Missing message not properly handled');
    return false;
  }
  
  return true;
}

// Test subject detection edge cases
async function testSubjectDetection() {
  console.log('\n🧪 TESTING SUBJECT DETECTION EDGE CASES');
  console.log('=' .repeat(50));
  
  const testCases = [
    { input: "I need help with algebra", expected: "math" },
    { input: "Calculus is difficult", expected: "math" },
    { input: "Quantum physics", expected: "physics" },
    { input: "Organic chemistry", expected: "chemistry" },
    { input: "Human anatomy", expected: "biology" },
    { input: "Creative writing", expected: "english" },
    { input: "I like science", expected: "physics" }, // Default to physics
    { input: "Something random", expected: null }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Testing: "${testCase.input}"`);
    
    const result = await makeAPICall("English", null); // Set language first
    if (!result.success) continue;
    
    const result2 = await makeAPICall(testCase.input, result.data.conversationState);
    if (!result2.success) continue;
    
    const { conversationState } = result2.data;
    const detectedSubject = conversationState?.subject;
    
    if (detectedSubject === testCase.expected) {
      console.log(`✅ Correctly detected: ${detectedSubject}`);
    } else {
      console.log(`❌ Expected ${testCase.expected}, got ${detectedSubject}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE AI TUTOR API TESTS');
  console.log('=' .repeat(60));
  
  let allTestsPassed = true;
  
  // Test conversation flows
  for (const scenario of testScenarios) {
    const passed = await testConversationFlow(scenario);
    if (!passed) {
      allTestsPassed = false;
    }
  }
  
  // Test error handling
  const errorHandlingPassed = await testErrorHandling();
  if (!errorHandlingPassed) {
    allTestsPassed = false;
  }
  
  // Test subject detection
  await testSubjectDetection();
  
  // Final results
  console.log('\n' + '=' .repeat(60));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! AI Tutor API is working correctly.');
  } else {
    console.log('❌ SOME TESTS FAILED. Please check the implementation.');
  }
  console.log('=' .repeat(60));
  
  return allTestsPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testConversationFlow,
  testErrorHandling,
  testSubjectDetection,
  makeAPICall
}; 