const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  localURL: 'http://localhost:3000/api/ai-tutor',
  vercelURL: 'https://your-vercel-app.vercel.app/api/ai-tutor',
  useLocal: true // Set to false to test Vercel deployment
};

// Test scenarios with expected outcomes
const TEST_SCENARIOS = [
  {
    name: 'Math Tutor with Chess Hobby',
    description: 'Find math tutor who likes chess and programming',
    messages: [
      'English',
      'I need help with math',
      'I can study at 17:00 on weekdays',
      'I prefer English',
      'I like chess and programming'
    ],
    expectedSubject: 'math',
    expectedLanguages: ['English'],
    expectedHobbies: ['chess', 'programming'],
    expectedTimeSlots: ['17:00']
  },
  {
    name: 'Physics Tutor with Russian Language',
    description: 'Find physics tutor who speaks Russian',
    messages: [
      'Russian',
      'Мне нужна помощь по физике',
      'Я могу заниматься в 18:00 по будням',
      'Я предпочитаю русский язык',
      'Мне нравятся астрономия и шахматы'
    ],
    expectedSubject: 'physics',
    expectedLanguages: ['Russian'],
    expectedHobbies: ['astronomy', 'chess'],
    expectedTimeSlots: ['18:00']
  },
  {
    name: 'English Tutor with Business Focus',
    description: 'Find English tutor with business interests',
    messages: [
      'English',
      'I need help with English',
      'I can study at 15:00 on weekends',
      'I prefer English and French',
      'I like business networking and wine tasting'
    ],
    expectedSubject: 'english',
    expectedLanguages: ['English', 'French'],
    expectedHobbies: ['business networking', 'wine tasting'],
    expectedTimeSlots: ['15:00']
  },
  {
    name: 'Chemistry Tutor with Cooking Interest',
    description: 'Find chemistry tutor who likes cooking',
    messages: [
      'English',
      'I want to learn chemistry',
      'I can study at 19:00 on weekdays',
      'I prefer English',
      'I enjoy cooking and gardening'
    ],
    expectedSubject: 'chemistry',
    expectedLanguages: ['English'],
    expectedHobbies: ['cooking', 'gardening'],
    expectedTimeSlots: ['19:00']
  }
];

// Test the AI tutor API with step-by-step conversation
async function testAITutorAPI(scenario) {
  console.log(`\n📋 Testing: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log('=' .repeat(60));
  
  let conversationState = null;
  const results = [];
  
  for (let i = 0; i < scenario.messages.length; i++) {
    const message = scenario.messages[i];
    console.log(`\n📝 Step ${i + 1}: "${message}"`);
    
    try {
      const response = await axios.post(
        TEST_CONFIG.useLocal ? TEST_CONFIG.localURL : TEST_CONFIG.vercelURL,
        {
          message: message,
          conversationState: conversationState
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = response.data;
      console.log('✅ Response:', data.response);
      console.log('🔄 Type:', data.type);
      console.log('📊 Step:', data.conversationState?.step);
      
      // Store results for analysis
      results.push({
        step: i + 1,
        message: message,
        response: data.response,
        type: data.type,
        conversationState: data.conversationState,
        tutors: data.tutors || null
      });
      
      conversationState = data.conversationState;
      
      // Show tutors if found
      if (data.tutors && data.tutors.length > 0) {
        console.log(`🎯 Found ${data.tutors.length} tutors:`);
        data.tutors.forEach((tutor, index) => {
          console.log(`   ${index + 1}. ${tutor.name} (${tutor.subject}) - Score: ${tutor.score}`);
          console.log(`      Languages: ${tutor.languagesSpoken.join(', ')}`);
          console.log(`      Available: ${tutor.availableTime.join(', ')}`);
          console.log(`      Hobbies: ${tutor.hobbies.join(', ')}`);
          if (tutor.matchingReasons) {
            console.log(`      Matching reasons: ${tutor.matchingReasons.join(', ')}`);
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Make sure the server is running on the correct port');
      }
      return null;
    }
  }
  
  return results;
}

// Analyze test results
function analyzeResults(scenario, results) {
  console.log(`\n🔍 Analysis for: ${scenario.name}`);
  console.log('-'.repeat(40));
  
  if (!results || results.length === 0) {
    console.log('❌ No results to analyze');
    return;
  }
  
  // Check conversation flow
  const finalResult = results[results.length - 1];
  const conversationState = finalResult.conversationState;
  
  console.log('📊 Conversation Flow Analysis:');
  console.log(`   Final step: ${conversationState?.step || 'unknown'}`);
  console.log(`   Subject: ${conversationState?.subject || 'not set'}`);
  console.log(`   Time slots: ${conversationState?.timeSlots?.join(', ') || 'not set'}`);
  console.log(`   Languages: ${conversationState?.languages?.join(', ') || 'not set'}`);
  console.log(`   Hobbies: ${conversationState?.hobbies?.join(', ') || 'not set'}`);
  
  // Verify expected values
  let score = 0;
  const maxScore = 4;
  
  if (conversationState?.subject === scenario.expectedSubject) {
    console.log('✅ Subject matches expected');
    score++;
  } else {
    console.log(`❌ Subject mismatch: expected ${scenario.expectedSubject}, got ${conversationState?.subject}`);
  }
  
  if (conversationState?.timeSlots && scenario.expectedTimeSlots.every(time => 
    conversationState.timeSlots.includes(time))) {
    console.log('✅ Time slots match expected');
    score++;
  } else {
    console.log(`❌ Time slots mismatch: expected ${scenario.expectedTimeSlots.join(', ')}, got ${conversationState?.timeSlots?.join(', ')}`);
  }
  
  if (conversationState?.languages && scenario.expectedLanguages.every(lang => 
    conversationState.languages.includes(lang))) {
    console.log('✅ Languages match expected');
    score++;
  } else {
    console.log(`❌ Languages mismatch: expected ${scenario.expectedLanguages.join(', ')}, got ${conversationState?.languages?.join(', ')}`);
  }
  
  if (conversationState?.hobbies && scenario.expectedHobbies.some(hobby => 
    conversationState.hobbies.includes(hobby))) {
    console.log('✅ Hobbies match expected');
    score++;
  } else {
    console.log(`❌ Hobbies mismatch: expected ${scenario.expectedHobbies.join(', ')}, got ${conversationState?.hobbies?.join(', ')}`);
  }
  
  // Check tutor matching
  if (finalResult.tutors && finalResult.tutors.length > 0) {
    console.log('\n🎯 Tutor Matching Analysis:');
    console.log(`   Found ${finalResult.tutors.length} tutors`);
    
    const bestTutor = finalResult.tutors[0];
    console.log(`   Best match: ${bestTutor.name} (Score: ${bestTutor.score})`);
    
    // Verify the best tutor matches the subject
    if (bestTutor.subject === scenario.expectedSubject) {
      console.log('✅ Best tutor subject matches expected');
      score++;
    } else {
      console.log(`❌ Best tutor subject mismatch: expected ${scenario.expectedSubject}, got ${bestTutor.subject}`);
    }
    
    // Check if any tutor has matching languages
    const hasMatchingLanguage = finalResult.tutors.some(tutor => 
      scenario.expectedLanguages.some(lang => tutor.languagesSpoken.includes(lang))
    );
    if (hasMatchingLanguage) {
      console.log('✅ Found tutor with matching language');
      score++;
    } else {
      console.log('❌ No tutor with matching language found');
    }
    
    maxScore += 2; // Add 2 more points for tutor matching
  } else {
    console.log('❌ No tutors found');
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  console.log(`\n📈 Test Score: ${score}/${maxScore} (${percentage}%)`);
  
  if (percentage >= 80) {
    console.log('🎉 Test PASSED!');
  } else if (percentage >= 60) {
    console.log('⚠️  Test PARTIALLY PASSED');
  } else {
    console.log('❌ Test FAILED');
  }
  
  return { score, maxScore, percentage };
}

// Run comprehensive tests
async function runComprehensiveTests() {
  console.log('🧪 Comprehensive AI Tutor API Testing');
  console.log('=' .repeat(60));
  console.log(`🌐 Testing URL: ${TEST_CONFIG.useLocal ? 'Local' : 'Vercel'}`);
  console.log(`🔗 Endpoint: ${TEST_CONFIG.useLocal ? TEST_CONFIG.localURL : TEST_CONFIG.vercelURL}`);
  console.log(`⏰ Timeout: 30 seconds per request`);
  
  const testResults = [];
  
  for (const scenario of TEST_SCENARIOS) {
    const results = await testAITutorAPI(scenario);
    const analysis = analyzeResults(scenario, results);
    testResults.push({ scenario, results, analysis });
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('=' .repeat(60));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.analysis && r.analysis.percentage >= 80).length;
  const partialTests = testResults.filter(r => r.analysis && r.analysis.percentage >= 60 && r.analysis.percentage < 80).length;
  const failedTests = testResults.filter(r => !r.analysis || r.analysis.percentage < 60).length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed (≥80%): ${passedTests}`);
  console.log(`Partial (60-79%): ${partialTests}`);
  console.log(`Failed (<60%): ${failedTests}`);
  
  const overallScore = testResults.reduce((sum, r) => sum + (r.analysis?.score || 0), 0);
  const overallMax = testResults.reduce((sum, r) => sum + (r.analysis?.maxScore || 0), 0);
  const overallPercentage = overallMax > 0 ? Math.round((overallScore / overallMax) * 100) : 0;
  
  console.log(`\n🎯 Overall Score: ${overallScore}/${overallMax} (${overallPercentage}%)`);
  
  if (overallPercentage >= 80) {
    console.log('🎉 All tests PASSED! AI Tutor API is working correctly.');
  } else if (overallPercentage >= 60) {
    console.log('⚠️  Tests PARTIALLY PASSED. Some issues need attention.');
  } else {
    console.log('❌ Tests FAILED. Significant issues need to be fixed.');
  }
  
  return testResults;
}

// Test specific functionality
async function testSpecificFunctionality() {
  console.log('\n🔧 Testing Specific Functionality');
  console.log('=' .repeat(40));
  
  const tests = [
    {
      name: 'Invalid Subject',
      message: 'I need help with underwater basket weaving',
      expectedType: 'needs_info'
    },
    {
      name: 'Invalid Time Format',
      message: 'I can study at 25:00',
      expectedType: 'needs_info'
    },
    {
      name: 'Invalid Language',
      message: 'I prefer Klingon',
      expectedType: 'needs_info'
    },
    {
      name: 'Empty Message',
      message: '',
      expectedType: 'error'
    }
  ];
  
  for (const test of tests) {
    console.log(`\n📝 Testing: ${test.name}`);
    console.log(`Message: "${test.message}"`);
    
    try {
      const response = await axios.post(
        TEST_CONFIG.useLocal ? TEST_CONFIG.localURL : TEST_CONFIG.vercelURL,
        {
          message: test.message,
          conversationState: null
        }
      );
      
      console.log(`✅ Response type: ${response.data.type}`);
      console.log(`Response: ${response.data.response}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Main execution
async function main() {
  try {
    await runComprehensiveTests();
    await testSpecificFunctionality();
    console.log('\n✅ All testing completed!');
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { 
  runComprehensiveTests, 
  testSpecificFunctionality, 
  TEST_SCENARIOS,
  TEST_CONFIG 
}; 