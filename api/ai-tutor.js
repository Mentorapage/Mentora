const OpenAI = require('openai');

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI client initialized');
} else {
  console.log('⚠️  OpenAI API key not found, will use manual matching only');
}

// Mock tutors database
const MOCK_TUTORS = [
  {
    name: 'Emma Chen',
    subject: 'math',
    bio: 'Calculus and algebra specialist with 5 years of experience.',
    availableTime: ['16:00–19:00', 'Weekends'],
    hobbies: ['chess', 'programming', 'hiking'],
    languagesSpoken: ['English', 'Mandarin'],
    telegram: '@emma_math_tutor'
  },
  {
    name: 'Marcus Thompson',
    subject: 'math',
    bio: 'Statistics and probability expert. Former data scientist.',
    availableTime: ['18:00–21:00', 'Mon-Wed-Fri'],
    hobbies: ['data analysis', 'basketball', 'cooking'],
    languagesSpoken: ['English'],
    telegram: '@marcus_stats'
  },
  {
    name: 'Aisha Patel',
    subject: 'math',
    bio: 'International Baccalaureate math specialist from Mumbai.',
    availableTime: ['14:00–17:00', 'Daily'],
    hobbies: ['classical music', 'debate', 'meditation'],
    languagesSpoken: ['English', 'Hindi', 'Gujarati'],
    telegram: '@aisha_ib_math'
  },
  {
    name: 'Carlos Mendoza',
    subject: 'math',
    bio: 'Geometry and trigonometry expert from Mexico City.',
    availableTime: ['15:00–18:00', 'Weekdays'],
    hobbies: ['soccer', 'architecture', 'guitar'],
    languagesSpoken: ['English', 'Spanish'],
    telegram: '@carlos_geometry'
  },
  {
    name: 'David Kim',
    subject: 'math',
    bio: 'Applied mathematics specialist from Seoul.',
    availableTime: ['17:00–20:00', 'Daily'],
    hobbies: ['robotics', 'video games', 'taekwondo'],
    languagesSpoken: ['English', 'Korean'],
    telegram: '@david_applied_math'
  },
  {
    name: 'Jonathan Blake',
    subject: 'english',
    bio: 'Creative writing and literature expert from London.',
    availableTime: ['17:00–20:00', 'Mon-Wed-Fri'],
    hobbies: ['writing', 'theater', 'poetry'],
    languagesSpoken: ['English'],
    telegram: '@jonathan_writer'
  },
  {
    name: 'Maya Singh',
    subject: 'english',
    bio: 'ESL specialist and IELTS preparation expert from New Delhi.',
    availableTime: ['18:00–21:00', 'Daily'],
    hobbies: ['travel', 'languages', 'cultural exchange'],
    languagesSpoken: ['English', 'Hindi', 'Punjabi'],
    telegram: '@maya_esl'
  },
  {
    name: 'Sophie Laurent',
    subject: 'english',
    bio: 'Business English and professional communication expert from Paris.',
    availableTime: ['15:00–18:00', 'Tue-Thu-Sat'],
    hobbies: ['business networking', 'wine tasting', 'cycling'],
    languagesSpoken: ['English', 'French', 'German'],
    telegram: '@sophie_business_eng'
  },
  {
    name: 'Dr. Elena Volkov',
    subject: 'physics',
    bio: 'PhD in Theoretical Physics from Moscow State University.',
    availableTime: ['18:00–21:00', 'Mon-Wed-Fri'],
    hobbies: ['astronomy', 'chess', 'classical music'],
    languagesSpoken: ['English', 'Russian'],
    telegram: '@elena_quantum'
  },
  {
    name: 'Marcus Johnson',
    subject: 'physics',
    bio: 'Experimental physics specialist from MIT.',
    availableTime: ['16:00–19:00', 'Tue-Thu-Sat'],
    hobbies: ['robotics', 'electronics', 'rock climbing'],
    languagesSpoken: ['English'],
    telegram: '@marcus_experimental'
  },
  {
    name: 'Dr. Sarah Mitchell',
    subject: 'chemistry',
    bio: 'Organic chemistry specialist from Oxford University.',
    availableTime: ['17:00–20:00', 'Weekdays'],
    hobbies: ['cooking', 'gardening', 'wine chemistry'],
    languagesSpoken: ['English'],
    telegram: '@sarah_organic_chem'
  },
  {
    name: 'Dr. Priya Sharma',
    subject: 'biology',
    bio: 'Medical school professor specializing in human anatomy.',
    availableTime: ['19:00–22:00', 'Daily'],
    hobbies: ['medical research', 'yoga', 'nature photography'],
    languagesSpoken: ['English', 'Hindi'],
    telegram: '@priya_med_bio'
  }
];

// Helper functions
function detectSubject(userMessage) {
  const message = userMessage.toLowerCase();
  if (message.includes('math') || message.includes('математика')) return 'math';
  if (message.includes('physics') || message.includes('физика')) return 'physics';
  if (message.includes('chemistry') || message.includes('химия')) return 'chemistry';
  if (message.includes('biology') || message.includes('биология')) return 'biology';
  if (message.includes('english') || message.includes('английский')) return 'english';
  if (message.includes('science') || message.includes('наука')) return 'physics';
  return null;
}

function parseUserTimeInput(userMessage) {
  const timeSlots = [];
  const message = userMessage.toLowerCase();
  
  const timePatterns = [
    /(\d{1,2}):(\d{2})/g,
    /(\d{1,2})-(\d{1,2})/g,
    /(\d{1,2})(am|pm)/gi,
  ];
  
  timePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      if (pattern.source.includes(':')) {
        const hour = parseInt(match[1]);
        if (hour >= 15 && hour <= 22) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
      } else if (pattern.source.includes('-')) {
        const startHour = parseInt(match[1]);
        if (startHour >= 15 && startHour <= 22) {
          timeSlots.push(`${startHour.toString().padStart(2, '0')}:00`);
        }
      } else {
        const hour = parseInt(match[1]);
        const period = match[2].toLowerCase();
        let adjustedHour = hour;
        if (period === 'pm' && hour !== 12) adjustedHour += 12;
        if (period === 'am' && hour === 12) adjustedHour = 0;
        if (adjustedHour >= 15 && adjustedHour <= 22) {
          timeSlots.push(`${adjustedHour.toString().padStart(2, '0')}:00`);
        }
      }
    }
  });
  
  return [...new Set(timeSlots)];
}

function detectLanguage(userMessage) {
  const message = userMessage.toLowerCase();
  const languages = [];
  
  const languageMap = {
    'english': 'English',
    'russian': 'Russian',
    'mandarin': 'Mandarin',
    'spanish': 'Spanish',
    'french': 'French',
    'german': 'German',
    'japanese': 'Japanese',
    'korean': 'Korean',
    'arabic': 'Arabic',
    'hindi': 'Hindi'
  };
  
  for (const [key, value] of Object.entries(languageMap)) {
    if (message.includes(key)) {
      languages.push(value);
    }
  }
  
  return languages.length > 0 ? languages : null;
}

function parseHobbies(userMessage) {
  const message = userMessage.toLowerCase();
  const hobbies = [];
  
  const hobbyKeywords = {
    'chess': ['chess', 'шахматы'],
    'programming': ['programming', 'coding', 'программирование'],
    'hiking': ['hiking', 'походы', 'trekking'],
    'basketball': ['basketball', 'баскетбол'],
    'cooking': ['cooking', 'кулинария'],
    'music': ['music', 'музыка'],
    'debate': ['debate', 'дебаты'],
    'swimming': ['swimming', 'плавание'],
    'volleyball': ['volleyball', 'волейбол'],
    'drawing': ['drawing', 'рисование', 'art'],
    'reading': ['reading', 'чтение'],
    'tennis': ['tennis', 'теннис'],
    'dancing': ['dancing', 'танцы'],
    'singing': ['singing', 'пение'],
    'baking': ['baking', 'выпечка'],
    'photography': ['photography', 'фотография'],
    'gaming': ['gaming', 'игры'],
    'writing': ['writing', 'письмо'],
    'theater': ['theater', 'театр'],
    'poetry': ['poetry', 'поэзия'],
    'travel': ['travel', 'путешествия'],
    'languages': ['languages', 'языки'],
    'astronomy': ['astronomy', 'астрономия'],
    'robotics': ['robotics', 'робототехника'],
    'electronics': ['electronics', 'электроника'],
    'rock climbing': ['rock climbing', 'скалолазание'],
    'gardening': ['gardening', 'садоводство'],
    'yoga': ['yoga', 'йога'],
    'martial arts': ['martial arts', 'боевые искусства'],
    'anime': ['anime', 'аниме'],
    'manga': ['manga', 'манга'],
    'architecture': ['architecture', 'архитектура'],
    'guitar': ['guitar', 'гитара'],
    'board games': ['board games', 'настольные игры'],
    'research': ['research', 'исследование'],
    'history': ['history', 'история'],
    'business networking': ['business networking', 'деловые связи'],
    'wine tasting': ['wine tasting', 'дегустация вина'],
    'cycling': ['cycling', 'велоспорт'],
    'storytelling': ['storytelling', 'рассказывание историй'],
    'environmental activism': ['environmental activism', 'экологическая активность'],
    'sustainable living': ['sustainable living', 'устойчивый образ жизни'],
    'medical research': ['medical research', 'медицинские исследования'],
    'nature photography': ['nature photography', 'фотография природы'],
    'scuba diving': ['scuba diving', 'дайвинг'],
    'marine conservation': ['marine conservation', 'охрана моря'],
    'competitive puzzles': ['competitive puzzles', 'соревновательные головоломки'],
    'taekwondo': ['taekwondo', 'тхэквондо'],
    'classical music': ['classical music', 'классическая музыка'],
    'meditation': ['meditation', 'медитация'],
    'soccer': ['soccer', 'футбол'],
    'data analysis': ['data analysis', 'анализ данных'],
    'wine chemistry': ['wine chemistry', 'химия вина']
  };
  
  for (const [hobby, keywords] of Object.entries(hobbyKeywords)) {
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        hobbies.push(hobby);
        break;
      }
    }
  }
  
  return [...new Set(hobbies)];
}

// AI-powered tutor matching using GPT-4.1-mini
async function findBestTutorsWithAI(userPreferences, allTutors) {
  // If OpenAI is not available, use manual matching
  if (!openai) {
    console.log('🤖 OpenAI not available, using manual matching');
    return findTutorsManually(userPreferences, allTutors);
  }

  const prompt = `
You are an AI tutor matching system for Mentora. Analyze the user preferences and tutor database to find the best matches.

USER PREFERENCES:
- Subject: ${userPreferences.subject}
- Time slots: ${userPreferences.timeSlots.join(', ')}
- Languages: ${userPreferences.languages.join(', ')}
- Hobbies/Preferences: ${userPreferences.hobbies.join(', ')}

TUTOR DATABASE (${allTutors.length} tutors):
${allTutors.map(tutor => `
Name: ${tutor.name}
Subject: ${tutor.subject}
Languages: ${tutor.languagesSpoken.join(', ')}
Available: ${tutor.availableTime.join(', ')}
Hobbies: ${tutor.hobbies.join(', ')}
Bio: ${tutor.bio}
`).join('\n')}

SCORING SYSTEM:
- Subject match: 9000 points (exact match required)
- Time availability: 900 points (at least one time slot matches)
- Language match: 90 points (at least one language matches)
- Hobby match: 10 points (at least one hobby matches)

INSTRUCTIONS:
1. Filter tutors by subject match first (only include exact subject matches)
2. For each matching tutor, calculate their total score
3. Return exactly 3 tutors with the highest scores
4. Format your response as a JSON array with tutor objects

RESPONSE FORMAT:
[
  {
    "name": "Tutor Name",
    "subject": "subject",
    "score": 9990,
    "scoreBreakdown": {
      "subject": 9000,
      "time": 900,
      "language": 90,
      "hobbies": 0
    },
    "matchingReasons": ["Subject matches", "Time available", "Language matches"]
  }
]

Only return valid JSON. Do not include any other text.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise tutor matching system. Return only valid JSON arrays with exactly 3 tutor matches.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content;
    console.log('🤖 Using GPT-4.1-mini for AI response');
    console.log('🔥 USING GPT-4.1-MINI - NOT ALGORITHM!');
    console.log('✅ GPT-4.1-mini response received');
    console.log('🔍 Model used:', completion.model);

    const matches = JSON.parse(response);
    return matches.slice(0, 3);
  } catch (error) {
    console.error('❌ AI matching failed:', error);
    console.log('🔄 Falling back to manual matching');
    return findTutorsManually(userPreferences, allTutors);
  }
}

// Manual fallback matching logic
function findTutorsManually(userPreferences, allTutors) {
  const matches = [];
  
  for (const tutor of allTutors) {
    let score = 0;
    const scoreBreakdown = { subject: 0, time: 0, language: 0, hobbies: 0 };
    const matchingReasons = [];
    
    // Subject matching (9000 points)
    if (tutor.subject === userPreferences.subject) {
      score += 9000;
      scoreBreakdown.subject = 9000;
      matchingReasons.push('Subject matches');
    } else {
      continue;
    }
    
    // Time matching (900 points)
    const tutorTimes = tutor.availableTime[0];
    const [startTime, endTime] = tutorTimes.split('–');
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    let timeMatches = false;
    for (const userTime of userPreferences.timeSlots) {
      const userHour = parseInt(userTime.split(':')[0]);
      if (userHour >= startHour && userHour <= endHour) {
        timeMatches = true;
        break;
      }
    }
    
    if (timeMatches) {
      score += 900;
      scoreBreakdown.time = 900;
      matchingReasons.push('Time available');
    }
    
    // Language matching (90 points)
    const languageMatches = tutor.languagesSpoken.some(lang => 
      userPreferences.languages.includes(lang)
    );
    if (languageMatches) {
      score += 90;
      scoreBreakdown.language = 90;
      matchingReasons.push('Language matches');
    }
    
    // Hobby matching (10 points)
    const hobbyMatches = tutor.hobbies.some(hobby => 
      userPreferences.hobbies.includes(hobby)
    );
    if (hobbyMatches) {
      score += 10;
      scoreBreakdown.hobbies = 10;
      matchingReasons.push('Hobby matches');
    }
    
    matches.push({
      name: tutor.name,
      subject: tutor.subject,
      score: score,
      scoreBreakdown: scoreBreakdown,
      matchingReasons: matchingReasons
    });
  }
  
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// Main conversation handler
async function handleConversation(userMessage, conversationState) {
  const state = conversationState || {
    step: 0,
    subject: null,
    timeSlots: null,
    languages: null,
    hobbies: null,
    interfaceLanguage: 'English'
  };

  // Step 0: Language selection
  if (state.step === 0 && !state.interfaceLanguage) {
    if (userMessage.toLowerCase().includes('russian') || userMessage.toLowerCase().includes('русский')) {
      return {
        type: 'needs_info',
        response: 'Отлично! Теперь скажите, какой предмет вы хотели бы изучать.',
        conversationState: { ...state, step: 1, interfaceLanguage: 'Russian' }
      };
    } else if (userMessage.toLowerCase().includes('english') || userMessage.toLowerCase().includes('англ')) {
      return {
        type: 'needs_info',
        response: "Great! I'll help you in English. What subject do you need help with?",
        conversationState: { ...state, step: 1, interfaceLanguage: 'English' }
      };
    } else {
      return {
        type: 'needs_info',
        response: 'Which language do you prefer to continue in: English or Russian?',
        conversationState: state
      };
    }
  }

  // Step 1: Subject detection
  if (state.step === 1 && !state.subject) {
    const subject = detectSubject(userMessage);
    if (subject) {
      const message = state.interfaceLanguage === 'Russian' 
        ? `Отлично! Давайте найдем репетитора по ${subject}. Когда можете заниматься? (Укажите дни и часы с 15:00 до 22:00)`
        : `Excellent! Let's find you a ${subject} tutor. When can you study? (Specify days and hours from 15:00 to 22:00)`;
      
      return {
        type: 'needs_info',
        response: message,
        conversationState: { ...state, step: 2, subject: subject }
      };
    } else {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Укажите предмет: math, physics, chemistry, biology, english'
        : 'Please specify a subject: math, physics, chemistry, biology, or english';
      return {
        type: 'needs_info',
        response: message,
        conversationState: state
      };
    }
  }

  // Step 2: Time slots
  if (state.step === 2 && !state.timeSlots) {
    const timeSlots = parseUserTimeInput(userMessage);
    if (timeSlots.length > 0) {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Замечательно! На каком языке должен говорить ваш репетитор?'
        : 'Excellent! Which language should your tutor use for teaching?';
      
      return {
        type: 'needs_info',
        response: message,
        conversationState: { ...state, step: 3, timeSlots: timeSlots }
      };
    } else {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Укажите время, например: "17:00" или "17-19"'
        : 'Please specify time, e.g., "17:00" or "17-19"';
      return {
        type: 'needs_info',
        response: message,
        conversationState: state
      };
    }
  }

  // Step 3: Teaching language
  if (state.step === 3 && !state.languages) {
    const languages = detectLanguage(userMessage);
    if (languages && languages.length > 0) {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Отлично! Есть ли у вас хобби, предпочтения в стиле обучения или что-то, что вы хотели бы видеть в преподавателе?'
        : "Wonderful! Any hobbies or learning preferences you'd like to mention?";
      
      return {
        type: 'needs_info',
        response: message,
        conversationState: { ...state, step: 4, languages: languages }
      };
    } else {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Мы поддерживаем английский, русский, китайский, испанский, французский, немецкий, японский, корейский, арабский и хинди.'
        : 'We support English, Russian, Mandarin, Spanish, French, German, Japanese, Korean, Arabic, and Hindi.';
      return {
        type: 'needs_info',
        response: message,
        conversationState: state
      };
    }
  }

  // Step 4: Find tutors using AI
  if (state.step === 4) {
    const hobbies = parseHobbies(userMessage);
    
    const userPreferences = {
      subject: state.subject,
      timeSlots: state.timeSlots,
      languages: state.languages,
      hobbies: hobbies || []
    };
    
    console.log('🔍 FILTERING TUTORS:', userPreferences);
    
    const bestMatches = await findBestTutorsWithAI(userPreferences, MOCK_TUTORS);
    
    const matchedTutors = bestMatches.map(match => {
      const tutor = MOCK_TUTORS.find(t => t.name === match.name);
      return {
        ...tutor,
        score: match.score,
        scoreBreakdown: match.scoreBreakdown,
        matchingReasons: match.matchingReasons
      };
    });
    
    const message = state.interfaceLanguage === 'Russian' 
      ? `Нашел ${matchedTutors.length} отличных репетиторов для вас!`
      : `Found ${matchedTutors.length} excellent tutors for you!`;
    
    return {
      type: 'tutor_matches',
      response: message,
      tutors: matchedTutors,
      conversationState: { ...state, step: 0, hobbies: hobbies }
    };
  }

  return {
    type: 'needs_info',
    response: state.interfaceLanguage === 'Russian' ? 'Не понимаю. Попробуйте еще раз.' : 'I need more information.',
    conversationState: state
  };
}

// Vercel API handler (default export)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { message, conversationState } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Received message:', message);
    console.log('🔄 Conversation state:', conversationState);

    const result = await handleConversation(message, conversationState);

    console.log('✅ Response type:', result.type);
    console.log('📤 Sending response:', result.response || result.tutors?.length || 'No response');

    res.status(200).json({
      type: result.type,
      response: result.response,
      tutors: result.tutors || null,
      conversationState: result.conversationState
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Export functions for testing (only in development)
if (process.env.NODE_ENV === 'development') {
  module.exports.handleConversation = handleConversation;
  module.exports.detectSubject = detectSubject;
  module.exports.parseUserTimeInput = parseUserTimeInput;
  module.exports.detectLanguage = detectLanguage;
  module.exports.parseHobbies = parseHobbies;
  module.exports.findBestTutorsWithAI = findBestTutorsWithAI;
  module.exports.findTutorsManually = findTutorsManually;
} 