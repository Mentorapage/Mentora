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

// ✅ NEW: Exact same logic as frontend filter system
async function findTutorsWithExactFilterLogic({ subject, timeSlots, teachingLanguage, preferences, interfaceLanguage }) {
  console.log(`🔍 AI TUTOR FILTERING: subject=${subject}, timeSlots=${JSON.stringify(timeSlots)}, language=${teachingLanguage}`);
  
  // Convert MOCK_TUTORS to frontend TEACHERS format for consistency
  const TEACHERS = MOCK_TUTORS.map((tutor, index) => ({
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=06b6d4&color=fff&size=96`,
    name: { 
      en: tutor.name, 
      ru: tutor.name
    },
    subject: tutor.subject,
    bio: {
      en: tutor.bio,
      ru: tutor.bio
    },
    resume: {
      en: `${tutor.name} specializes in ${tutor.subject} and brings unique expertise to every lesson.`,
      ru: `${tutor.name} специализируется на ${tutor.subject} и привносит уникальный опыт в каждый урок.`
    },
    telegram: '#',
    about: {
      en: `${tutor.bio} I've been tutoring for 2+ years and specialize in making complex concepts accessible through interactive learning.`,
      ru: `${tutor.bio} Я преподаю уже более 2 лет и специализируюсь на том, чтобы делать сложные концепции доступными.`
    },
    subjects: [{ en: tutor.subject, ru: tutor.subject }],
    teachingLanguages: {
      en: tutor.languagesSpoken ? tutor.languagesSpoken.join(', ') : 'English',
      ru: tutor.languagesSpoken ? tutor.languagesSpoken.join(', ') : 'English'
    },
    subjectsTaught: {
      en: tutor.subject.charAt(0).toUpperCase() + tutor.subject.slice(1),
      ru: tutor.subject.charAt(0).toUpperCase() + tutor.subject.slice(1)
    },
    teachingStyle: {
      en: tutor.teachingStyle ? tutor.teachingStyle.charAt(0).toUpperCase() + tutor.teachingStyle.slice(1) : 'Interactive',
      ru: tutor.teachingStyle ? tutor.teachingStyle.charAt(0).toUpperCase() + tutor.teachingStyle.slice(1) : 'Интерактивный'
    },
    experience: {
      en: '2+ years tutoring experience',
      ru: '2+ года опыта преподавания'
    },
    rate: {
      en: 'Free (Volunteer)',
      ru: 'Бесплатно (Волонтер)'
    },
    hobbies: {
      en: tutor.hobbies.join(', '),
      ru: tutor.hobbies.join(', ')
    },
    availability: generateAvailability(tutor.availableTime)
  }));

  // EXACT same filtering logic as frontend
  let filtered = [...TEACHERS];
  
  // Step 1: Apply mandatory subject filter
  filtered = filtered.filter(t => matchesSubject(t, subject));
  
  // Step 2: Apply availability filter (if time slots provided)
  if (timeSlots && timeSlots.length > 0) {
    // Convert time slots to frontend format (days + times)
    const availabilityFilter = [];
    
    // Add time slots
    availabilityFilter.push(...timeSlots);
    
    // Add any day information if provided in user input
    // For now, assume any day is acceptable if not specified
    
    filtered = filtered.filter(t => matchesAvailability(t, availabilityFilter));
  }
  
  // Step 3: Apply language filter
  if (teachingLanguage) {
    const languageFilter = [teachingLanguage];
    filtered = filtered.filter(t => matchesLanguages(t, languageFilter));
  }
  
  console.log(`✅ AI TUTOR FILTERED: ${filtered.length} tutors passed all filters`);
  filtered.forEach(t => console.log(`   - ${t.name.en}: ${t.subject}`));

  if (filtered.length === 0) {
    const message = interfaceLanguage === 'Russian' 
      ? 'К сожалению, нет репетиторов, соответствующих всем вашим требованиям.'
      : 'Sorry, no tutors match all your requirements.';
    return { tutorIds: [], explanation: message };
  }

  // Apply hobby scoring for ranking (same as frontend)
  const scoredTutors = filtered.map(tutor => {
    let hobbyScore = 0;
    if (preferences && preferences.toLowerCase() !== 'no' && preferences.toLowerCase() !== 'none') {
      const originalTutor = MOCK_TUTORS.find(mt => mt.name === tutor.name.en);
      if (originalTutor) {
        const tutorHobbies = originalTutor.hobbies || [];
        const prefWords = preferences.toLowerCase().split(/[\s,]+/);
        const matches = prefWords.filter(word => 
          tutorHobbies.some(hobby => hobby.toLowerCase().includes(word))
        );
        hobbyScore = matches.length / prefWords.length; // 0-1 score
      }
    }
    
    return { ...tutor, hobbyScore };
  });

  // Sort by hobby score (highest first), then alphabetically
  scoredTutors.sort((a, b) => {
    if (b.hobbyScore !== a.hobbyScore) {
      return b.hobbyScore - a.hobbyScore;
    }
    return a.name.en.localeCompare(b.name.en);
  });
  
  const top3 = scoredTutors.slice(0, 3);
  
  const tutorIds = top3.map(tutor => tutor.name.en.toLowerCase().replace(/[^a-z]/g, '-'));
  const explanation = interfaceLanguage === 'Russian' 
    ? `Отлично! ${top3.length} репетитор(ов) доступны. Вот ваши лучшие варианты:`
    : `Wonderful! ${top3.length} tutor(s) found. Here are your top choices:`;

  return { tutorIds, explanation };
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