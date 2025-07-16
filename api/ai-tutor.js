import OpenAI from 'openai';
import { MOCK_TUTORS } from '../mock-tutors.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ FIXED: AI Tutor now uses EXACT same logic as frontend filter system
async function strictStepByStepProcess(userMessage, conversationState) {
  const state = conversationState || {
    step: 0,
    subject: null,
    timeSlots: null,
    teachingLanguage: null,
    preferences: null,
    isTutorSearch: false
  };

  // Step 0: Language selection (interface language)
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
        conversationState: { ...state, step: 2, subject: subject, isTutorSearch: true }
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
        ? 'Укажите время, например: "17-19" или "Wed 17:00"'
        : 'Please specify time, e.g., "17-19" or "Wed 17:00"';
      return {
        type: 'needs_info',
        response: message,
        conversationState: state
      };
    }
  }

  // Step 3: Teaching language
  if (state.step === 3 && !state.teachingLanguage) {
    let teachingLanguage = null;
    if (userMessage.toLowerCase().includes('english') || userMessage.toLowerCase().includes('англ')) {
      teachingLanguage = 'English';
    } else if (userMessage.toLowerCase().includes('russian') || userMessage.toLowerCase().includes('рус')) {
      teachingLanguage = 'Russian';
    }

    if (teachingLanguage) {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Отлично! Есть ли у вас хобби, предпочтения в стиле обучения или что-то, что вы хотели бы видеть в преподавателе?'
        : "Wonderful! Any hobbies or learning preferences you'd like to mention?";
      
      return {
        type: 'needs_info',
        response: message,
        conversationState: { ...state, step: 4, teachingLanguage: teachingLanguage }
      };
    } else {
      const message = state.interfaceLanguage === 'Russian' 
        ? 'Мы поддерживаем только английский и русский как языки преподавания.'
        : 'We support English and Russian for teaching languages.';
      return {
        type: 'needs_info',
        response: message,
        conversationState: state
      };
    }
  }

  // Step 4: Find tutors using EXACT same logic as frontend filter system
  if (state.step === 4) {
    const result = await findTutorsWithExactFilterLogic({
      subject: state.subject,
      timeSlots: state.timeSlots,
      teachingLanguage: state.teachingLanguage,
      preferences: userMessage,
      interfaceLanguage: state.interfaceLanguage
    });
    
    return {
      type: 'tutor_matches',
      tutorIds: result.tutorIds,
      explanation: result.explanation,
      conversationState: { ...state, step: 0, preferences: userMessage, isTutorSearch: false }
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
  const dayPatterns = {
    'monday': 'monday', 'mon': 'monday', 'понедельник': 'monday',
    'tuesday': 'tuesday', 'tue': 'tuesday', 'вторник': 'tuesday',
    'wednesday': 'wednesday', 'wed': 'wednesday', 'среда': 'wednesday',
    'thursday': 'thursday', 'thu': 'thursday', 'четверг': 'thursday',
    'friday': 'friday', 'fri': 'friday', 'пятница': 'friday',
    'saturday': 'saturday', 'sat': 'saturday', 'суббота': 'saturday',
    'sunday': 'sunday', 'sun': 'sunday', 'воскресенье': 'sunday'
  };
  
  // Extract time patterns
  const timePatterns = [
    /(\d{1,2}):(\d{2})/g,  // 17:00, 9:30
    /(\d{1,2})-(\d{1,2})/g,  // 17-19, 9-11
    /(\d{1,2}) to (\d{1,2})/g,  // 17 to 19
    /(\d{1,2}) до (\d{1,2})/g   // 17 до 19 (Russian)
  ];
  
  timePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const startHour = parseInt(match[1]);
      const endHour = parseInt(match[2]);
      
      if (startHour >= 15 && startHour <= 22 && endHour >= 15 && endHour <= 22) {
        for (let hour = startHour; hour < endHour; hour++) {
          timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
      }
    }
  });
  
  // If no specific times found, try to extract single hours
  if (timeSlots.length === 0) {
    const singleHourPattern = /\b(1[5-9]|2[0-2])\b/g;
    let match;
    while ((match = singleHourPattern.exec(message)) !== null) {
      const hour = parseInt(match[1]);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }
  
  return [...new Set(timeSlots)];
}

// ✅ EXACT same filtering logic as frontend
async function findTutorsWithExactFilterLogic({ subject, timeSlots, teachingLanguage, preferences, interfaceLanguage }) {
  console.log('🔍 FILTERING TUTORS:', { subject, timeSlots, teachingLanguage });
  
  // Filter tutors using EXACT same logic as frontend
  const filteredTutors = MOCK_TUTORS.filter(tutor => {
    // Subject filter
    if (!matchesSubject(tutor, subject)) {
      console.log(`❌ ${tutor.name}: Subject mismatch (${tutor.subject} ≠ ${subject})`);
      return false;
    }
    
    // Availability filter
    if (!matchesAvailability(tutor, timeSlots)) {
      console.log(`❌ ${tutor.name}: ${timeSlots.join(', ')} not in range ${tutor.availableTime.join(', ')}`);
      return false;
    }
    
    // Language filter
    if (!matchesLanguages(tutor, [teachingLanguage])) {
      console.log(`❌ ${tutor.name}: Language mismatch`);
      return false;
    }
    
    console.log(`✅ ${tutor.name}: Available for requested time slots`);
    return true;
  });
  
  console.log(`✅ FILTERED CANDIDATES: ${filteredTutors.length} tutors passed all filters`);
  filteredTutors.forEach(tutor => {
    console.log(`   - ${tutor.name}: ${tutor.availableTime.join(', ')}`);
  });
  
  if (filteredTutors.length === 0) {
    const message = interfaceLanguage === 'Russian' 
      ? 'К сожалению, не нашлось репетиторов, соответствующих вашим критериям. Попробуйте изменить время или предмет.'
      : 'Sorry, no tutors found matching your criteria. Try adjusting the time or subject.';
    
    return {
      tutorIds: [],
      explanation: message
    };
  }
  
  // Score tutors using EXACT same logic as frontend
  const scoredTutors = filteredTutors.map(tutor => {
    let score = 0;
    const maxScore = 10000;
    
    // Subject match (90% weight)
    const subjectScore = 9000;
    score += subjectScore;
    
    // Time match (9% weight)
    const timeScore = 900;
    score += timeScore;
    
    // Language match (0.9% weight)
    const languageScore = 90;
    score += languageScore;
    
    // Hobbies match (0.1% weight)
    const hobbyScore = calculateHobbyScore(tutor, preferences);
    score += hobbyScore;
    
    console.log(`🎯 SCORING: ${tutor.name}`);
    console.log(`   Subject: ${subjectScore}/${maxScore * 0.9} (${(subjectScore / (maxScore * 0.9) * 100).toFixed(1)}%)`);
    console.log(`   Time: ${timeScore}/${maxScore * 0.09} (${(timeScore / (maxScore * 0.09) * 100).toFixed(1)}%)`);
    console.log(`   Language: ${languageScore}/${maxScore * 0.009} (${(languageScore / (maxScore * 0.009) * 100).toFixed(1)}%)`);
    console.log(`   Hobbies: ${hobbyScore}/${maxScore * 0.001} (${(hobbyScore / (maxScore * 0.001) * 100).toFixed(1)}%)`);
    console.log(`   TOTAL: ${score}/${maxScore} (${(score / maxScore * 100).toFixed(1)}%)`);
    
    return { tutor, score };
  });
  
  // Sort by score (highest first)
  scoredTutors.sort((a, b) => b.score - a.score);
  
  // Get top 3 tutors
  const topTutors = scoredTutors.slice(0, 3);
  const tutorIds = topTutors.map(item => item.tutor.name);
  
  // Generate explanation using GPT-4.1-mini
  const explanation = await generateTutorExplanation(topTutors, preferences, interfaceLanguage);
  
  return {
    tutorIds,
    explanation
  };
}

function calculateHobbyScore(tutor, preferences) {
  if (!preferences || !tutor.hobbies) return 0;
  
  const preferenceWords = preferences.toLowerCase().split(/\s+/);
  const tutorHobbies = tutor.hobbies.map(h => h.toLowerCase());
  
  let matches = 0;
  preferenceWords.forEach(word => {
    if (tutorHobbies.some(hobby => hobby.includes(word) || word.includes(hobby))) {
      matches++;
    }
  });
  
  return Math.min(matches * 2, 10); // Max 10 points for hobbies
}

async function generateTutorExplanation(tutors, preferences, interfaceLanguage) {
  try {
    console.log('🤖 Using GPT-4.1-mini for AI response');
    console.log('🔥 USING GPT-4.1-MINI - NOT ALGORITHM!');
    
    const tutorInfo = tutors.map((item, index) => {
      const tutor = item.tutor;
      return `${index + 1}. ${tutor.name} - ${tutor.subject} specialist
   - Bio: ${tutor.bio}
   - Available: ${tutor.availableTime.join(', ')}
   - Languages: ${tutor.languagesSpoken.join(', ')}
   - Hobbies: ${tutor.hobbies.join(', ')}
   - Teaching Style: ${tutor.teachingStyle}`;
    }).join('\n\n');
    
    const systemPrompt = interfaceLanguage === 'Russian' 
      ? `Ты помощник по поиску репетиторов для платформы Mentora. Предоставь краткое, дружелюбное объяснение найденных репетиторов. Используй неформальный тон, как будто разговариваешь с другом.`
      : `You are a tutor matching assistant for the Mentora platform. Provide a brief, friendly explanation of the found tutors. Use a casual tone as if talking to a friend.`;
    
    const userPrompt = interfaceLanguage === 'Russian'
      ? `Вот ${tutors.length} репетиторов, которые подходят под критерии пользователя${preferences ? ` (предпочтения: ${preferences})` : ''}:\n\n${tutorInfo}\n\nПредоставь краткое объяснение на русском языке, почему эти репетиторы подходят.`
      : `Here are ${tutors.length} tutors that match the user's criteria${preferences ? ` (preferences: ${preferences})` : ''}:\n\n${tutorInfo}\n\nProvide a brief explanation in English of why these tutors are a good match.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    
    console.log('✅ GPT-4.1-mini response received');
    console.log('🔍 Model used:', completion.model);
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error generating explanation:', error);
    return interfaceLanguage === 'Russian' 
      ? 'Найдены подходящие репетиторы! Свяжитесь с ними через Telegram.'
      : 'Great tutors found! Contact them via Telegram.';
  }
}

function matchesSubject(tutor, selectedSubject) {
  return tutor.subject === selectedSubject;
}

function matchesAvailability(tutor, selectedTimes) {
  if (!selectedTimes || selectedTimes.length === 0) return true;
  
  const availStr = tutor.availableTime.join(' ').toLowerCase();
  let tutorTimeRanges = [];
  let tutorDays = [];
  
  // Parse tutor's time ranges
  tutor.availableTime.forEach(timeEntry => {
    const timeRangeMatch = timeEntry.match(/(\d{1,2}):(\d{2})–(\d{1,2}):(\d{2})/);
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
  
  // Check if any selected time matches tutor's availability
  return selectedTimes.some(timeSlot => {
    const requestedHour = parseInt(timeSlot.split(':')[0]);
    return tutorTimeRanges.some(timeRange => 
      requestedHour >= timeRange.start && requestedHour < timeRange.end
    );
  });
}

function matchesLanguages(tutor, selectedLanguages) {
  if (!selectedLanguages.length) return true;
  
  const tutorLanguages = tutor.languagesSpoken || ['English'];
  
  return selectedLanguages.some(lang => 
    tutorLanguages.some(tutorLang => 
      tutorLang.toLowerCase().includes(lang.toLowerCase())
    )
  );
}

// Vercel serverless function handler
export default async function handler(req, res) {
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
    
    console.log('🤖 Using EXACT filter logic for AI response');
    const result = await strictStepByStepProcess(prompt, conversationState);
    
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
} 