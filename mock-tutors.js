// Mock dataset of 20 diverse tutor profiles for the FreePrep platform
// Each tutor has unique specializations, availability patterns, and backgrounds

export const MOCK_TUTORS = [
  // MATH TUTORS (7 profiles)
  {
    name: 'Emma Chen',
    subject: 'math',
    bio: 'Calculus and algebra specialist with 5 years of experience. I make complex mathematical concepts simple and enjoyable through visual learning techniques.',
    availableTime: ['16:00–19:00', 'Weekends'],
    hobbies: ['chess', 'programming', 'hiking'],
    languagesSpoken: ['English', 'Mandarin'],
    teachingStyle: 'visual',
    embedding: null
  },
  {
    name: 'Marcus Thompson',
    subject: 'math',
    bio: 'Statistics and probability expert. Former data scientist who loves helping students understand the real-world applications of mathematics.',
    availableTime: ['18:00–21:00', 'Mon-Wed-Fri'],
    hobbies: ['data analysis', 'basketball', 'cooking'],
    languagesSpoken: ['English'],
    teachingStyle: 'analytical',
    embedding: null
  },
  {
    name: 'Aisha Patel',
    subject: 'math',
    bio: 'International Baccalaureate math specialist from Mumbai. I help students excel in advanced mathematics through structured problem-solving approaches.',
    availableTime: ['14:00–17:00', 'Daily'],
    hobbies: ['classical music', 'debate', 'meditation'],
    languagesSpoken: ['English', 'Hindi', 'Gujarati'],
    teachingStyle: 'structured',
    embedding: null
  },
  {
    name: 'Carlos Mendoza',
    subject: 'math',
    bio: 'Geometry and trigonometry expert from Mexico City. I specialize in helping students visualize mathematical relationships through interactive tools.',
    availableTime: ['15:00–18:00', 'Weekdays'],
    hobbies: ['soccer', 'architecture', 'guitar'],
    languagesSpoken: ['English', 'Spanish'],
    teachingStyle: 'interactive',
    embedding: null
  },
  {
    name: 'Fatima Al-Rashid',
    subject: 'math',
    bio: 'Competition mathematics coach from Dubai. I prepare students for math olympiads and advanced problem-solving competitions.',
    availableTime: ['19:00–22:00', 'Tue-Thu-Sat'],
    hobbies: ['competitive puzzles', 'astronomy', 'calligraphy'],
    languagesSpoken: ['English', 'Arabic', 'French'],
    teachingStyle: 'competitive',
    embedding: null
  },
  {
    name: 'David Kim',
    subject: 'math',
    bio: 'Applied mathematics specialist from Seoul. I focus on connecting mathematical theory to real-world engineering and technology applications.',
    availableTime: ['17:00–20:00', 'Daily'],
    hobbies: ['robotics', 'video games', 'taekwondo'],
    languagesSpoken: ['English', 'Korean'],
    teachingStyle: 'practical',
    embedding: null
  },
  {
    name: 'Isabella Santos',
    subject: 'math',
    bio: 'Elementary and middle school math specialist from São Paulo. I build strong foundational skills through games and creative activities.',
    availableTime: ['16:00–19:00', 'Mon-Wed-Fri'],
    hobbies: ['board games', 'dance', 'art'],
    languagesSpoken: ['English', 'Portuguese'],
    teachingStyle: 'playful',
    embedding: null
  },
  {
    name: 'Alex Rodriguez',
    subject: 'math',
    bio: 'Calculus and advanced mathematics tutor from Madrid. I specialize in helping students master complex mathematical concepts through step-by-step problem solving.',
    availableTime: ['17:00–20:00', 'Tue-Thu-Sat'],
    hobbies: ['soccer', 'piano', 'chess'],
    languagesSpoken: ['English', 'Spanish'],
    teachingStyle: 'methodical',
    embedding: null
  },

  // ENGLISH TUTORS (6 profiles)
  {
    name: 'Jonathan Blake',
    subject: 'english',
    bio: 'Creative writing and literature expert from London. Published author who helps students develop their unique voice and master literary analysis.',
    availableTime: ['17:00–20:00', 'Mon-Wed-Fri'],
    hobbies: ['writing', 'theater', 'poetry'],
    languagesSpoken: ['English'],
    teachingStyle: 'creative',
    embedding: null
  },
  {
    name: 'Maya Singh',
    subject: 'english',
    bio: 'ESL specialist and IELTS preparation expert from New Delhi. I help non-native speakers achieve fluency and confidence in English communication.',
    availableTime: ['18:00–21:00', 'Daily'],
    hobbies: ['travel', 'languages', 'cultural exchange'],
    languagesSpoken: ['English', 'Hindi', 'Punjabi'],
    teachingStyle: 'communicative',
    embedding: null
  },
  {
    name: 'Ahmed Hassan',
    subject: 'english',
    bio: 'Academic writing specialist from Cairo. I teach advanced essay writing, research methods, and critical thinking skills for university preparation.',
    availableTime: ['20:00–23:00', 'Weekends'],
    hobbies: ['research', 'history', 'debate'],
    languagesSpoken: ['English', 'Arabic'],
    teachingStyle: 'academic',
    embedding: null
  },
  {
    name: 'Sophie Laurent',
    subject: 'english',
    bio: 'Business English and professional communication expert from Paris. I help students master workplace communication and presentation skills.',
    availableTime: ['15:00–18:00', 'Tue-Thu-Sat'],
    hobbies: ['business networking', 'wine tasting', 'cycling'],
    languagesSpoken: ['English', 'French', 'German'],
    teachingStyle: 'professional',
    embedding: null
  },
  {
    name: 'Ryan O\'Connor',
    subject: 'english',
    bio: 'Shakespeare and classical literature specialist from Dublin. I make ancient texts accessible and engaging for modern students.',
    availableTime: ['19:00–22:00', 'Weekdays'],
    hobbies: ['theater', 'Irish music', 'storytelling'],
    languagesSpoken: ['English', 'Irish Gaelic'],
    teachingStyle: 'dramatic',
    embedding: null
  },
  {
    name: 'Kenji Tanaka',
    subject: 'english',
    bio: 'TOEFL preparation specialist from Tokyo. I help Japanese students overcome common language barriers and achieve high English proficiency scores.',
    availableTime: ['16:00–19:00', 'Weekends'],
    hobbies: ['anime', 'manga', 'martial arts'],
    languagesSpoken: ['English', 'Japanese'],
    teachingStyle: 'systematic',
    embedding: null
  },

  // PHYSICS TUTORS (3 profiles)
  {
    name: 'Dr. Elena Volkov',
    subject: 'physics',
    bio: 'PhD in Theoretical Physics from Moscow State University. I specialize in quantum mechanics and help students understand the mysteries of the universe.',
    availableTime: ['18:00–21:00', 'Mon-Wed-Fri'],
    hobbies: ['astronomy', 'chess', 'classical music'],
    languagesSpoken: ['English', 'Russian'],
    teachingStyle: 'theoretical',
    embedding: null
  },
  {
    name: 'Marcus Johnson',
    subject: 'physics',
    bio: 'Experimental physics specialist from MIT. I help students visualize abstract physics concepts through hands-on demonstrations and laboratory work.',
    availableTime: ['16:00–19:00', 'Tue-Thu-Sat'],
    hobbies: ['robotics', 'electronics', 'rock climbing'],
    languagesSpoken: ['English'],
    teachingStyle: 'experimental',
    embedding: null
  },
  {
    name: 'Raj Gupta',
    subject: 'physics',
    bio: 'Astrophysics researcher from Bangalore. I connect physics principles to space exploration and help students understand cosmic phenomena.',
    availableTime: ['20:00–23:00', 'Daily'],
    hobbies: ['stargazing', 'space documentaries', 'photography'],
    languagesSpoken: ['English', 'Hindi', 'Tamil'],
    teachingStyle: 'cosmic',
    embedding: null
  },

  // CHEMISTRY TUTORS (2 profiles)
  {
    name: 'Dr. Sarah Mitchell',
    subject: 'chemistry',
    bio: 'Organic chemistry specialist from Oxford University. I make complex chemical reactions understandable through real-world applications and visual models.',
    availableTime: ['17:00–20:00', 'Weekdays'],
    hobbies: ['cooking', 'gardening', 'wine chemistry'],
    languagesSpoken: ['English'],
    teachingStyle: 'practical',
    embedding: null
  },
  {
    name: 'Liu Wei',
    subject: 'chemistry',
    bio: 'Environmental chemistry expert from Beijing. I help students understand how chemistry impacts our environment and daily life.',
    availableTime: ['19:00–22:00', 'Mon-Wed-Fri-Sun'],
    hobbies: ['environmental activism', 'hiking', 'sustainable living'],
    languagesSpoken: ['English', 'Mandarin'],
    teachingStyle: 'environmental',
    embedding: null
  },

  // BIOLOGY TUTORS (2 profiles)
  {
    name: 'Dr. Priya Sharma',
    subject: 'biology',
    bio: 'Medical school professor specializing in human anatomy and physiology. I prepare pre-med students for MCAT and advanced biological concepts.',
    availableTime: ['19:00–22:00', 'Daily'],
    hobbies: ['medical research', 'yoga', 'nature photography'],
    languagesSpoken: ['English', 'Hindi'],
    teachingStyle: 'medical',
    embedding: null
  },
  {
    name: 'Alexandra Torres',
    subject: 'biology',
    bio: 'Marine biology specialist from the Galápagos Research Institute. I bring the wonders of ocean life and evolution to the classroom.',
    availableTime: ['15:00–18:00', 'Weekends'],
    hobbies: ['scuba diving', 'underwater photography', 'conservation'],
    languagesSpoken: ['English', 'Spanish'],
    teachingStyle: 'exploratory',
    embedding: null
  }
];

// Helper function to get tutors by subject
export function getTutorsBySubject(subject) {
  return MOCK_TUTORS.filter(tutor => tutor.subject === subject);
}

// Helper function to get random tutors for testing
export function getRandomTutors(count = 10) {
  const shuffled = [...MOCK_TUTORS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Subject distribution summary
export const SUBJECT_SUMMARY = {
  math: 7,
  english: 6, 
  physics: 3,
  chemistry: 2,
  biology: 2,
  total: 20
};

// Common hobbies for testing hobby matching
export const COMMON_HOBBIES = [
  'chess', 'reading', 'hiking', 'photography', 'travel', 'cooking',
  'music', 'swimming', 'programming', 'theater', 'yoga', 'gaming',
  'art', 'sports', 'research', 'writing', 'languages', 'volunteering'
];

// Time slots for availability testing
export const TIME_SLOTS = [
  'Morning (8:00-12:00)', 'Afternoon (12:00-17:00)', 'Evening (17:00-22:00)',
  'Weekdays', 'Weekends', 'Daily', 'Flexible'
];

console.log(`Mock dataset generated: ${MOCK_TUTORS.length} tutors across ${Object.keys(SUBJECT_SUMMARY).length - 1} subjects`); 