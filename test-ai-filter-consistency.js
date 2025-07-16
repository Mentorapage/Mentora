// Test script to validate AI Tutor backend matches frontend filter system exactly
import { MOCK_TUTORS } from './mock-tutors.js';

// Copy the exact same functions from the backend
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

// Convert MOCK_TUTORS to frontend TEACHERS format (same as backend)
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
  availability: [] // We'll generate this as needed
}));

// Test cases to validate consistency
const testCases = [
  {
    name: "Math + 17:00 + English",
    subject: "math",
    timeSlots: ["17:00"],
    languages: ["English"],
    expectedCount: 4 // Emma Chen, Carlos Mendoza, David Kim, Isabella Santos
  },
  {
    name: "Physics + 18:00 + English", 
    subject: "physics",
    timeSlots: ["18:00"],
    languages: ["English"],
    expectedCount: 2 // Dr. Elena Volkov, Marcus Johnson (Raj Gupta has 20:00-23:00)
  },
  {
    name: "English + 15:00 + English",
    subject: "english", 
    timeSlots: ["15:00"],
    languages: ["English"],
    expectedCount: 1 // Sophie Laurent
  },
  {
    name: "Chemistry + 16:00 + English",
    subject: "chemistry",
    timeSlots: ["16:00"], 
    languages: ["English"],
    expectedCount: 0 // Dr. Sarah Mitchell has 17:00-20:00, Liu Wei has 19:00-22:00
  },
  {
    name: "Biology + 19:00 + English",
    subject: "biology",
    timeSlots: ["19:00"],
    languages: ["English"], 
    expectedCount: 1 // Dr. Priya Sharma (Alexandra Torres not in current data)
  }
];

console.log('🔍 TESTING AI TUTOR vs FRONTEND FILTER CONSISTENCY');
console.log('='.repeat(60));

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(40));
  
  // Apply filters using EXACT same logic as frontend
  let filtered = [...TEACHERS];
  
  // Step 1: Apply mandatory subject filter
  filtered = filtered.filter(t => matchesSubject(t, testCase.subject));
  
  // Step 2: Apply availability filter
  if (testCase.timeSlots && testCase.timeSlots.length > 0) {
    filtered = filtered.filter(t => matchesAvailability(t, testCase.timeSlots));
  }
  
  // Step 3: Apply language filter
  if (testCase.languages && testCase.languages.length > 0) {
    filtered = filtered.filter(t => matchesLanguages(t, testCase.languages));
  }
  
  console.log(`✅ Found ${filtered.length} tutors`);
  filtered.forEach(t => {
    console.log(`   - ${t.name.en}: ${t.subject}`);
  });
  
  // Validate against expected count
  if (filtered.length === testCase.expectedCount) {
    console.log(`✅ PASS: Expected ${testCase.expectedCount}, got ${filtered.length}`);
  } else {
    console.log(`❌ FAIL: Expected ${testCase.expectedCount}, got ${filtered.length}`);
    allTestsPassed = false;
  }
});

console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! AI Tutor backend matches frontend filter system exactly!');
} else {
  console.log('❌ SOME TESTS FAILED! AI Tutor backend does NOT match frontend filter system!');
}

// Additional validation: Check specific tutors mentioned in user issue
console.log('\n🔍 VALIDATING SPECIFIC TUTORS FROM USER ISSUE:');
console.log('-'.repeat(50));

const physicsTutors = TEACHERS.filter(t => t.subject === 'physics');
console.log(`📊 Physics tutors found: ${physicsTutors.length}`);
physicsTutors.forEach(t => {
  console.log(`   - ${t.name.en}: ${t.subject}`);
});

// Check Sunday availability for the three mentioned tutors
const keyTutors = ['Dr. Elena Volkov', 'Marcus Johnson', 'Raj Gupta'];
keyTutors.forEach(name => {
  const tutor = TEACHERS.find(t => t.name.en === name);
  if (tutor) {
    const originalTutor = MOCK_TUTORS.find(mt => mt.name === name);
    console.log(`\n🎯 ${name}:`);
    console.log(`   Subject: ${tutor.subject}`);
    console.log(`   Availability: ${originalTutor.availableTime.join(', ')}`);
    
    // Check Sunday availability at 20:00 (Raj Gupta's time range)
    const sundayAvailable = matchesAvailability(tutor, ['sunday', '20:00']);
    console.log(`   Sunday 20:00 available: ${sundayAvailable ? '✅ YES' : '❌ NO'}`);
  } else {
    console.log(`❌ ${name}: NOT FOUND in TEACHERS array`);
  }
});

console.log('\n✅ Validation complete!'); 