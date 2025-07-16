const axios = require('axios');

// Test the AI tutor API with step-by-step conversation
async function testAITutorAPI() {
  const baseURL = 'http://localhost:3000/api/ai-tutor';
  let conversationState = null;

  console.log('🧪 Testing AI Tutor API Step-by-Step Conversation\n');

  // Test 1: Language selection
  console.log('📝 Test 1: Language Selection');
  try {
    const response1 = await axios.post(baseURL, {
      message: 'English',
      conversationState: conversationState
    });
    console.log('✅ Response:', response1.data.response);
    conversationState = response1.data.conversationState;
    console.log('🔄 State:', conversationState);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return;
  }

  // Test 2: Subject selection
  console.log('\n📝 Test 2: Subject Selection');
  try {
    const response2 = await axios.post(baseURL, {
      message: 'I need help with math',
      conversationState: conversationState
    });
    console.log('✅ Response:', response2.data.response);
    conversationState = response2.data.conversationState;
    console.log('🔄 State:', conversationState);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return;
  }

  // Test 3: Time slots
  console.log('\n📝 Test 3: Time Slots');
  try {
    const response3 = await axios.post(baseURL, {
      message: 'I can study at 17:00 on weekdays',
      conversationState: conversationState
    });
    console.log('✅ Response:', response3.data.response);
    conversationState = response3.data.conversationState;
    console.log('🔄 State:', conversationState);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return;
  }

  // Test 4: Language preference
  console.log('\n📝 Test 4: Language Preference');
  try {
    const response4 = await axios.post(baseURL, {
      message: 'I prefer English',
      conversationState: conversationState
    });
    console.log('✅ Response:', response4.data.response);
    conversationState = response4.data.conversationState;
    console.log('🔄 State:', conversationState);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return;
  }

  // Test 5: Hobbies/Preferences
  console.log('\n📝 Test 5: Hobbies/Preferences');
  try {
    const response5 = await axios.post(baseURL, {
      message: 'I like chess and programming',
      conversationState: conversationState
    });
    console.log('✅ Response:', response5.data.response);
    console.log('🎯 Tutors found:', response5.data.tutors?.length || 0);
    
    if (response5.data.tutors) {
      console.log('\n🏆 Top Tutors:');
      response5.data.tutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.subject}) - Score: ${tutor.score}`);
        console.log(`   Languages: ${tutor.languagesSpoken.join(', ')}`);
        console.log(`   Available: ${tutor.availableTime.join(', ')}`);
        console.log(`   Hobbies: ${tutor.hobbies.join(', ')}`);
        console.log(`   Matching reasons: ${tutor.matchingReasons.join(', ')}`);
        console.log('');
      });
    }
    
    conversationState = response5.data.conversationState;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return;
  }

  console.log('✅ All tests completed successfully!');
}

// Test different scenarios
async function testMultipleScenarios() {
  console.log('🧪 Testing Multiple AI Tutor Scenarios\n');

  const scenarios = [
    {
      name: 'Math Tutor with Chess Hobby',
      messages: [
        'English',
        'I need help with math',
        'I can study at 17:00 on weekdays',
        'I prefer English',
        'I like chess and programming'
      ]
    },
    {
      name: 'Physics Tutor with Russian Language',
      messages: [
        'Russian',
        'Мне нужна помощь по физике',
        'Я могу заниматься в 18:00 по будням',
        'Я предпочитаю русский язык',
        'Мне нравятся астрономия и шахматы'
      ]
    },
    {
      name: 'English Tutor with Business Focus',
      messages: [
        'English',
        'I need help with English',
        'I can study at 15:00 on weekends',
        'I prefer English and French',
        'I like business networking and wine tasting'
      ]
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log('=' .repeat(50));
    
    let conversationState = null;
    
    for (let i = 0; i < scenario.messages.length; i++) {
      const message = scenario.messages[i];
      console.log(`\n📝 Step ${i + 1}: "${message}"`);
      
      try {
        const response = await axios.post('http://localhost:3000/api/ai-tutor', {
          message: message,
          conversationState: conversationState
        });
        
        console.log('✅ Response:', response.data.response);
        conversationState = response.data.conversationState;
        
        if (response.data.tutors) {
          console.log(`🎯 Found ${response.data.tutors.length} tutors:`);
          response.data.tutors.forEach((tutor, index) => {
            console.log(`   ${index + 1}. ${tutor.name} - Score: ${tutor.score}`);
          });
        }
      } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        break;
      }
    }
  }
}

// Run tests
async function runTests() {
  try {
    await testAITutorAPI();
    console.log('\n' + '='.repeat(60));
    await testMultipleScenarios();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if running directly
if (require.main === module) {
  runTests();
}

module.exports = { testAITutorAPI, testMultipleScenarios }; 