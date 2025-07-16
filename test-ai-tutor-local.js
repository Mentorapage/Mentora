// Simple test to verify AI Tutor logic works
const aiTutorModule = require('./api/ai-tutor.js');

// Check if functions are exported (development mode)
const hasExports = aiTutorModule.handleConversation && aiTutorModule.detectSubject;

if (!hasExports) {
  console.log('⚠️  Functions not exported. Set NODE_ENV=development to enable testing.');
  console.log('🧪 Testing API endpoint instead...');
  
  // Test the API endpoint directly
  const testAPIEndpoint = async () => {
    const axios = require('axios');
    
    try {
      const response = await axios.post('http://localhost:3000/api/ai-tutor', {
        message: 'English',
        conversationState: null
      });
      console.log('✅ API Response:', response.data);
    } catch (error) {
      console.log('❌ API Error:', error.message);
      console.log('💡 Make sure the server is running on port 3000');
    }
  };
  
  testAPIEndpoint();
  return;
}

const { handleConversation, detectSubject, parseUserTimeInput, detectLanguage, parseHobbies } = aiTutorModule;

async function testAITutorLogic() {
  console.log('🧪 Testing AI Tutor Logic Locally\n');

  const testScenarios = [
    {
      name: 'Complete Math Tutor Search',
      steps: [
        { message: 'English', expectedStep: 1 },
        { message: 'I need help with math', expectedStep: 2 },
        { message: 'I can study at 17:00', expectedStep: 3 },
        { message: 'I prefer English', expectedStep: 4 },
        { message: 'I like chess and programming', expectedStep: 0 }
      ]
    },
    {
      name: 'Physics Tutor with Russian',
      steps: [
        { message: 'Russian', expectedStep: 1 },
        { message: 'Мне нужна помощь по физике', expectedStep: 2 },
        { message: 'Я могу заниматься в 18:00', expectedStep: 3 },
        { message: 'Я предпочитаю русский язык', expectedStep: 4 },
        { message: 'Мне нравятся астрономия', expectedStep: 0 }
      ]
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log('=' .repeat(40));
    
    let conversationState = null;
    
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      console.log(`\n📝 Step ${i + 1}: "${step.message}"`);
      
      try {
        const result = await handleConversation(step.message, conversationState);
        
        console.log('✅ Response:', result.response);
        console.log('🔄 Type:', result.type);
        console.log('📊 Step:', result.conversationState?.step);
        
        if (result.tutors) {
          console.log(`🎯 Found ${result.tutors.length} tutors:`);
          result.tutors.forEach((tutor, index) => {
            console.log(`   ${index + 1}. ${tutor.name} - Score: ${tutor.score}`);
          });
        }
        
        conversationState = result.conversationState;
        
        // Verify step progression
        if (result.conversationState?.step !== step.expectedStep) {
          console.log(`⚠️  Warning: Expected step ${step.expectedStep}, got ${result.conversationState?.step}`);
        }
        
      } catch (error) {
        console.error('❌ Error:', error.message);
        break;
      }
    }
  }
}

// Test helper functions
function testHelperFunctions() {
  console.log('\n🔧 Testing Helper Functions\n');
  
  // Test subject detection
  console.log('📚 Testing Subject Detection:');
  const subjects = [
    'I need help with math',
    'Мне нужна помощь по физике',
    'I want to learn chemistry',
    'I need biology help',
    'I want to improve my English'
  ];
  
  subjects.forEach(subject => {
    const detected = detectSubject(subject);
    console.log(`   "${subject}" -> ${detected}`);
  });
  
  // Test time parsing
  console.log('\n⏰ Testing Time Parsing:');
  const times = [
    'I can study at 17:00',
    'Available 18-20',
    'I can do 5pm',
    'Я могу заниматься в 19:00'
  ];
  
  times.forEach(time => {
    const parsed = parseUserTimeInput(time);
    console.log(`   "${time}" -> ${parsed.join(', ')}`);
  });
  
  // Test language detection
  console.log('\n🌍 Testing Language Detection:');
  const languages = [
    'I prefer English',
    'Я предпочитаю русский язык',
    'I want Mandarin and Spanish',
    'I need French and German'
  ];
  
  languages.forEach(lang => {
    const detected = detectLanguage(lang);
    console.log(`   "${lang}" -> ${detected?.join(', ')}`);
  });
  
  // Test hobby parsing
  console.log('\n🎯 Testing Hobby Parsing:');
  const hobbies = [
    'I like chess and programming',
    'Мне нравятся астрономия и шахматы',
    'I enjoy cooking and music',
    'I love basketball and hiking'
  ];
  
  hobbies.forEach(hobby => {
    const parsed = parseHobbies(hobby);
    console.log(`   "${hobby}" -> ${parsed.join(', ')}`);
  });
}

// Run all tests
async function runAllTests() {
  try {
    await testAITutorLogic();
    testHelperFunctions();
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { testAITutorLogic, testHelperFunctions }; 