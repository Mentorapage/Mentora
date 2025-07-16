import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { MOCK_TUTORS } from './mock-tutors.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));

app.use(express.json());

// ✅ FIXED: AI Tutor now uses EXACT same logic as frontend filter system
async function strictStepByStepProcess(userMessage, conversationState) {
  const state = conversationState || {
    step: 0,
    subject: null,
    timeSlots: null,
    languages: null,
    hobbies: null,
    interfaceLanguage: null
  };

  // Step 0: Language selection (interface language)
  if (state.step === 0 && !state.interfaceLanguage) {
    const message = userMessage.toLowerCase();
    if (message.includes('russian') || message.includes('русский')) {
      return {
        type: 'needs_info',
        response: 'Отлично! Теперь скажите, какой предмет вы хотели бы изучать.',
        conversationState: { ...state, step: 1, interfaceLanguage: 'Russian' }
      };
    } else if (message.includes('english') || message.includes('англ')) {
      return {
        type: 'needs_info',
        response: "Great! I'll help you in English. What subject do you need help with?",
        conversationState: { ...state, step: 1, interfaceLanguage: 'English' }
      };
    } else {
      // Check if it's a subject instead of language
      const subject = detectSubject(userMessage);
      if (subject) {
        // User provided a subject directly, assume English interface
        const responseMessage = `Great! I'll help you in English. Let's find you a ${subject} tutor. When can you study? (Specify days and hours from 15:00 to 22:00)`;
        return {
          type: 'needs_info',
          response: responseMessage,
          conversationState: { ...state, step: 2, subject: subject, interfaceLanguage: 'English' }
        };
      }
      
      return {
        type: 'needs_info',
        response: 'Which language do you prefer to continue in: English or Russian?',
        conversationState: state
      };
    }
  }

  // Step 1: Subject detection (MANDATORY - 9000 points)
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

  // Step 2: Time slots (MANDATORY - 900 points)
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

  // Step 3: Teaching language (MANDATORY - 90 points)
  if (state.step === 3 && !state.languages) {
    const languages = detectLanguage(userMessage);
    if (languages && languages.length > 0) {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Отлично! Есть ли у вас хобби, предпочтения в стиле обучения или что-то, что вы хотели бы видеть в преподавателе? (Необязательно)'
        : "Wonderful! Any hobbies or learning preferences you'd like to mention? (Optional)";
      
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

  // Step 4: Find tutors using AI (OPTIONAL - 10 points for hobbies)
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

// ✅ FIXED: Subject detection without subtopic questions
function detectSubject(userMessage) {
  const message = userMessage.toLowerCase();
  if (message.includes('math') || message.includes('математика') || message.includes('algebra') || message.includes('calculus')) {
    return 'math';
  }
  if (message.includes('physics') || message.includes('физика') || message.includes('quantum') || message.includes('mechanics') ||
      message.includes('astrophysics') || message.includes('theoretical physics') || message.includes('experimental physics')) {
    return 'physics';
  }
  if (message.includes('chemistry') || message.includes('химия') || message.includes('organic') || message.includes('chemical') ||
      message.includes('environmental chemistry') || message.includes('biochemistry') || message.includes('organic chemistry')) {
    return 'chemistry';
  }
  if (message.includes('biology') || message.includes('биология') || message.includes('anatomy') || message.includes('marine') ||
      message.includes('medical biology') || message.includes('molecular biology') || message.includes('physiology')) {
    return 'biology';
  }
  if (message.includes('science') || message.includes('наука') || message.includes('научный')) {
    return 'physics'; // Default science to physics for backward compatibility
  }
  if (message.includes('english') || message.includes('английский') || message.includes('literature') || message.includes('writing')) {
    return 'english';
  }
  return null;
}

// ✅ FIXED: Better time parsing to handle "Wednesday 17:00", "17-19", etc.
function parseUserTimeInput(userMessage) {
  const timeSlots = [];
  const message = userMessage.toLowerCase();
  
  // Extract day information for future use
  let requestedDay = null;
  const dayMatch = message.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/);
  if (dayMatch) {
    const dayMapping = {
      'monday': 'mon', 'mon': 'mon',
      'tuesday': 'tue', 'tue': 'tue', 
      'wednesday': 'wed', 'wed': 'wed',
      'thursday': 'thu', 'thu': 'thu',
      'friday': 'fri', 'fri': 'fri',
      'saturday': 'sat', 'sat': 'sat',
      'sunday': 'sun', 'sun': 'sun'
    };
    requestedDay = dayMapping[dayMatch[1]];
  }
  
  // Handle ranges like "17-19", "15-17"
  const rangeMatch = message.match(/(\d{1,2})[:\-\s]*(\d{1,2})/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = parseInt(rangeMatch[2]);
    if (start < end && start >= 15 && end <= 22) {
      for (let hour = start; hour <= end; hour++) {
        timeSlots.push(hour.toString().padStart(2, '0') + ':00');
      }
    }
  }
  
  // Handle single times like "17:00", "19"
  const singleMatch = message.match(/(\d{1,2}):?00?/);
  if (singleMatch && timeSlots.length === 0) {
    const hour = parseInt(singleMatch[1]);
    if (hour >= 15 && hour <= 22) {
      timeSlots.push(hour.toString().padStart(2, '0') + ':00');
    }
  }
  
  return timeSlots.length > 0 ? timeSlots : [];
}

// ✅ NEW: Language detection function
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
    'hindi': 'Hindi',
    'portuguese': 'Portuguese',
    'gujarati': 'Gujarati',
    'punjabi': 'Punjabi',
    'tamil': 'Tamil',
    'catalan': 'Catalan',
    'irish gaelic': 'Irish Gaelic'
  };
  
  for (const [key, value] of Object.entries(languageMap)) {
    if (message.includes(key)) {
      languages.push(value);
    }
  }
  
  return languages.length > 0 ? languages : null;
}

// ✅ NEW: Hobby parsing function
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
    'wine chemistry': ['wine chemistry', 'химия вина'],
    'calligraphy': ['calligraphy', 'каллиграфия'],
    'dance': ['dance', 'танцы'],
    'art': ['art', 'искусство'],
    'cultural exchange': ['cultural exchange', 'культурный обмен'],
    'irish music': ['irish music', 'ирландская музыка'],
    'space documentaries': ['space documentaries', 'космические документальные фильмы'],
    'stargazing': ['stargazing', 'наблюдение за звездами'],
    'ocean photography': ['ocean photography', 'фотография океана']
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

// ✅ NEW: AI-powered tutor matching using GPT-4.1-mini
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

// ✅ NEW: Manual fallback matching logic with exact scoring
function findTutorsManually(userPreferences, allTutors) {
  const matches = [];
  
  for (const tutor of allTutors) {
    let score = 0;
    const scoreBreakdown = { subject: 0, time: 0, language: 0, hobbies: 0 };
    const matchingReasons = [];
    
    // Subject matching (9000 points) - EXACT MATCH REQUIRED
    if (tutor.subject === userPreferences.subject) {
      score += 9000;
      scoreBreakdown.subject = 9000;
      matchingReasons.push('Subject matches');
    } else {
      continue; // Skip tutors with wrong subject
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

// ✅ EXACT same functions as frontend filter system
function matchesSubject(tutor, selectedSubject) {
  if (!selectedSubject) return false;
  return tutor.subject === selectedSubject;
}

function matchesAvailability(tutor, selectedTimes) {
  if (!selectedTimes.length) return true;
  
  // Get the original tutor data for availability checking
  const originalTutor = MOCK_TUTORS.find(mt => mt.name === tutor.name.en);
  if (!originalTutor || !originalTutor.availableTime) return false;
  
  const tutorAvailability = originalTutor.availableTime;
  
  // Separate days and time slots from selection
  const selectedDays = selectedTimes.filter(time => 
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(time)
  );
  const selectedTimeSlots = selectedTimes.filter(time => 
    time.includes(':')
  );
  
  // Parse tutor's availability into days and time ranges
  let tutorDays = [];
  let tutorTimeRanges = [];
  
  tutorAvailability.forEach(availability => {
    const availStr = availability.toLowerCase();
    
    // Extract time ranges
    const timeRangeMatch = availStr.match(/(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})/);
    if (timeRangeMatch) {
      tutorTimeRanges.push({
        start: parseInt(timeRangeMatch[1]),
        end: parseInt(timeRangeMatch[3])
      });
    }
    
    // Extract day patterns
    if (availStr.includes('daily')) {
      tutorDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    } else if (availStr.includes('weekdays')) {
      tutorDays.push('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
    } else if (availStr.includes('weekends')) {
      tutorDays.push('saturday', 'sunday');
    } else {
      // Parse specific day patterns like "Mon-Wed-Fri"
      if (availStr.includes('mon')) tutorDays.push('monday');
      if (availStr.includes('tue')) tutorDays.push('tuesday');
      if (availStr.includes('wed')) tutorDays.push('wednesday');
      if (availStr.includes('thu')) tutorDays.push('thursday');
      if (availStr.includes('fri')) tutorDays.push('friday');
      if (availStr.includes('sat')) tutorDays.push('saturday');
      if (availStr.includes('sun')) tutorDays.push('sunday');
    }
  });
  
  // Remove duplicates from tutorDays
  tutorDays = [...new Set(tutorDays)];
  
  // Matrix intersection logic: Find any valid (day, time) combination
  if (selectedDays.length > 0 && selectedTimeSlots.length > 0) {
    // Both days and times selected - check for ANY intersection
    let hasIntersection = false;
    
    for (const day of selectedDays) {
      if (tutorDays.includes(day)) {
        for (const timeSlot of selectedTimeSlots) {
          const requestedHour = parseInt(timeSlot.split(':')[0]);
          for (const timeRange of tutorTimeRanges) {
            if (requestedHour >= timeRange.start && requestedHour < timeRange.end) {
              hasIntersection = true;
              break;
            }
          }
          if (hasIntersection) break;
        }
        if (hasIntersection) break;
      }
    }
    
    return hasIntersection;
  }
  
  // Only days selected - check if tutor is available on ANY selected day
  if (selectedDays.length > 0) {
    return selectedDays.some(day => tutorDays.includes(day));
  }
  
  // Only time slots selected - check if tutor is available at ANY selected time
  if (selectedTimeSlots.length > 0) {
    return selectedTimeSlots.some(timeSlot => {
      const requestedHour = parseInt(timeSlot.split(':')[0]);
      return tutorTimeRanges.some(timeRange => 
        requestedHour >= timeRange.start && requestedHour < timeRange.end
      );
    });
  }
  
  return true;
}

function matchesLanguages(tutor, selectedLanguages) {
  if (!selectedLanguages.length) return true;
  
  // Get the original tutor data for language checking
  const originalTutor = MOCK_TUTORS.find(mt => mt.name === tutor.name.en);
  if (!originalTutor) return false;
  
  const tutorLanguages = originalTutor.languagesSpoken || ['English'];
  
  return selectedLanguages.some(lang => 
    tutorLanguages.some(tutorLang => 
      tutorLang.toLowerCase().includes(lang.toLowerCase())
    )
  );
}

// ✅ EXACT same availability generation as frontend
function generateAvailability(tutorAvailableTime) {
  if (!tutorAvailableTime || tutorAvailableTime.length === 0) {
    return [];
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  
  let timeRange = null;
  let availableDays = [];
  
  // Parse availability entries to extract time range and day patterns
  tutorAvailableTime.forEach(timeEntry => {
    if (timeEntry.includes('–')) {
      // Format: "16:00–19:00" or similar
      const [startTime, endTime] = timeEntry.split('–');
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      timeRange = { start: startHour, end: endHour };
    } else {
      // Format: "Weekdays", "Weekends", "Daily", or "Mon-Wed-Fri"
      const dayPattern = timeEntry.toLowerCase();
      
      if (dayPattern === 'daily') {
        availableDays = [0, 1, 2, 3, 4, 5, 6]; // All days (Monday=0, Sunday=6)
      } else if (dayPattern === 'weekdays') {
        availableDays = [0, 1, 2, 3, 4]; // Monday to Friday
      } else if (dayPattern === 'weekends') {
        availableDays = [5, 6]; // Saturday and Sunday
      } else if (dayPattern.includes('-')) {
        // Parse patterns like "Mon-Wed-Fri" or "Tue-Thu-Sat"
        const dayAbbrevs = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const patternDays = dayPattern.split('-');
        patternDays.forEach(dayAbbrev => {
          const dayIndex = dayAbbrevs.indexOf(dayAbbrev.trim());
          if (dayIndex !== -1 && !availableDays.includes(dayIndex)) {
            availableDays.push(dayIndex);
          }
        });
      }
    }
  });
  
  // Generate availability slots only for the intersection of time range and available days
  const availableSlots = [];
  
  if (timeRange && availableDays.length > 0) {
    // Generate slots only for available days and times
    availableDays.forEach(dayIndex => {
      times.forEach((time, timeIndex) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour >= timeRange.start && hour < timeRange.end) {
          const slotIndex = dayIndex * times.length + timeIndex + 1;
          availableSlots.push(slotIndex);
        }
      });
    });
  } else if (availableDays.length > 0) {
    // Only day pattern specified, use all time slots for those days
    availableDays.forEach(dayIndex => {
      times.forEach((time, timeIndex) => {
        const slotIndex = dayIndex * times.length + timeIndex + 1;
        availableSlots.push(slotIndex);
      });
    });
  } else if (timeRange) {
    // Only time range specified, apply to all days
    days.forEach((day, dayIndex) => {
      times.forEach((time, timeIndex) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour >= timeRange.start && hour < timeRange.end) {
          const slotIndex = dayIndex * times.length + timeIndex + 1;
          availableSlots.push(slotIndex);
        }
      });
    });
  }

  return [...new Set(availableSlots)].sort((a, b) => a - b);
}

// Main endpoint using EXACT same logic as frontend filter system
app.post('/api/ai-tutor', async (req, res) => {
  try {
    
    const { prompt, conversationState } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }
    
    console.log('🤖 Using EXACT filter logic for AI response');
    const result = await strictStepByStepProcess(prompt, conversationState);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error in AI tutor endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      type: 'error',
      response: "I'm having trouble right now. Please try again.",
      conversationState: { step: 0, subject: null, timeSlots: null, language: null, isTutorSearch: false }
    });
  }
});

console.log('Mock dataset generated: 50 tutors across 3 subjects');
console.log('Loaded OpenAI Key (first 8 chars):', process.env.OPENAI_API_KEY?.substring(0, 8) || 'None');

app.listen(PORT, () => {
  console.log(`Mentora AI backend running on port ${PORT}`);
}); 