// Mentora SPA Interactivity Script
// All logic for navigation, language toggle, teachers, modals, and form

// --- Language Data ---
const LANGS = ['en', 'ru'];
let currentLang = 'en';

// --- Section Navigation ---
const navBtns = document.querySelectorAll('.nav-btn');
const sections = {
  home: document.getElementById('section-home'),
  teachers: document.getElementById('section-teachers'),
  become: document.getElementById('section-become'),
  faq: document.getElementById('section-faq')
};
function showSection(section, updateURL = true) {
  console.log(`Showing section: ${section}, updateURL: ${updateURL}`);
  
  Object.values(sections).forEach(sec => { sec.classList.add('hidden'); sec.classList.remove('fade'); });
  sections[section].classList.remove('hidden');
  sections[section].classList.add('fade');
  setTimeout(() => sections[section].classList.remove('fade'), 400);
  
  // Update URL hash if requested
  if (updateURL) {
    const newHash = section === 'home' ? '' : section;
    if (window.location.hash.replace('#', '') !== newHash) {
      window.location.hash = newHash;
      console.log(`URL updated to: ${window.location.href}`);
    }
  }
  
  // Update navigation button states
  navBtns.forEach(b => b.classList.remove('bg-cyan-700'));
  const navButton = document.getElementById(`nav-${section}`);
  if (navButton) {
    navButton.classList.add('bg-cyan-700');
  }
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    showSection(btn.dataset.section);
  });
});

// Function to get current section from URL
function getCurrentSectionFromURL() {
  const hash = window.location.hash.replace('#', '').toLowerCase().trim();
  const validSections = ['home', 'teachers', 'become', 'faq'];
  const section = validSections.includes(hash) ? hash : 'home';
  console.log(`Current URL hash: "${hash}", resolved section: "${section}"`);
  return section;
}

// Handle browser back/forward navigation
window.addEventListener('hashchange', (event) => {
  console.log('Hash changed:', event.oldURL, '->', event.newURL);
  const section = getCurrentSectionFromURL();
  showSection(section, false); // Don't update URL since we're responding to URL change
});

// Default section (will be set based on URL after DOM loads)
// showSection('home', false);

// --- Language Toggle ---
document.getElementById('lang-toggle').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'ru' : 'en';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
  // Update select options
  document.querySelectorAll('option[data-en]').forEach(opt => {
    opt.textContent = opt.dataset[currentLang];
  });
  // Update teacher cards and modal
  renderTeachers();
  
  // Update advanced filter display texts
  ['subjects', 'availability', 'languages', 'hobbies'].forEach(filterType => {
    const display = document.getElementById(`${filterType}-display`);
    if (display) {
      updateDisplayText(filterType, display);
    }
  });
  
  // Update modal content if open
  if (currentModalTutor) {
    populateModalContent(currentModalTutor);
  }
  
  // Update detailed modal if open
  updateDetailedModalLang();
  // Update FAQ content
  updateFAQLang();
  // Update value cards content
  updateValueCardsLang();
  // Update form content
  updateFormLang();
});

// --- Import Mock Dataset and Convert to Frontend Format ---
import { MOCK_TUTORS } from './mock-tutors.js';

// Function to generate a default profile photo SVG
function generateProfilePhoto(name, colorIndex = 0) {
  const colors = [
    ['#066666', '#088888'],
    ['#6D28D9', '#8B5CF6'],
    ['#DC2626', '#EF4444'],
    ['#059669', '#10B981'],
    ['#D97706', '#F59E0B'],
    ['#7C2D12', '#EA580C'],
    ['#1E40AF', '#3B82F6'],
    ['#BE123C', '#F43F5E']
  ];
  const [color1, color2] = colors[colorIndex % colors.length];
  
  return `data:image/svg+xml;base64,${btoa(`
<svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="150" height="150" fill="url(#gradient)"/>
<defs>
<linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
<stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
</linearGradient>
</defs>
<svg x="50" y="50" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
<path d="M20 21.12v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
<circle cx="12" cy="7" r="4" />
</svg>
</svg>
  `)}`;
}

// Function to convert tutor's availableTime to schedule format
function generateAvailability(tutorAvailableTime) {
  if (!tutorAvailableTime || tutorAvailableTime.length === 0) {
    return []; // No availability
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

  return [...new Set(availableSlots)].sort((a, b) => a - b); // Remove duplicates and sort
}

// Function to extract main subjects from bio or use primary subject
function extractSubjects(tutor) {
  const subjects = [];
  const bio = tutor.bio.toLowerCase();
  
  // Add primary subject
  if (tutor.subject === 'math') {
    if (bio.includes('algebra')) subjects.push({ en: 'Algebra', ru: 'Алгебра' });
    if (bio.includes('geometry')) subjects.push({ en: 'Geometry', ru: 'Геометрия' });
    if (bio.includes('calculus')) subjects.push({ en: 'Calculus', ru: 'Исчисление' });
    if (bio.includes('statistics') || bio.includes('data')) subjects.push({ en: 'Statistics', ru: 'Статистика' });
    if (bio.includes('trigonometry')) subjects.push({ en: 'Trigonometry', ru: 'Тригонометрия' });
    if (subjects.length === 0) subjects.push({ en: 'Mathematics', ru: 'Математика' });
  } else if (tutor.subject === 'english') {
    if (bio.includes('writing')) subjects.push({ en: 'Creative Writing', ru: 'Креативное письмо' });
    if (bio.includes('literature')) subjects.push({ en: 'Literature', ru: 'Литература' });
    if (bio.includes('grammar')) subjects.push({ en: 'Grammar', ru: 'Грамматика' });
    if (bio.includes('ielts') || bio.includes('toefl')) subjects.push({ en: 'IELTS/TOEFL', ru: 'IELTS/TOEFL' });
    if (bio.includes('esl')) subjects.push({ en: 'ESL', ru: 'Английский как иностранный' });
    if (subjects.length === 0) subjects.push({ en: 'English', ru: 'Английский язык' });
  } else if (tutor.subject === 'physics') {
    // Physics specializations
    if (bio.includes('quantum')) subjects.push({ en: 'Quantum Physics', ru: 'Квантовая физика' });
    if (bio.includes('mechanics')) subjects.push({ en: 'Mechanics', ru: 'Механика' });
    if (bio.includes('astrophysics') || bio.includes('astronomy')) subjects.push({ en: 'Astrophysics', ru: 'Астрофизика' });
    if (bio.includes('theoretical')) subjects.push({ en: 'Theoretical Physics', ru: 'Теоретическая физика' });
    if (bio.includes('experimental')) subjects.push({ en: 'Experimental Physics', ru: 'Экспериментальная физика' });
    if (subjects.length === 0) subjects.push({ en: 'Physics', ru: 'Физика' });
  } else if (tutor.subject === 'chemistry') {
    // Chemistry specializations
    if (bio.includes('organic')) subjects.push({ en: 'Organic Chemistry', ru: 'Органическая химия' });
    if (bio.includes('environmental')) subjects.push({ en: 'Environmental Chemistry', ru: 'Экологическая химия' });
    if (bio.includes('biochemistry')) subjects.push({ en: 'Biochemistry', ru: 'Биохимия' });
    if (subjects.length === 0) subjects.push({ en: 'Chemistry', ru: 'Химия' });
  } else if (tutor.subject === 'biology') {
    // Biology specializations
    if (bio.includes('marine')) subjects.push({ en: 'Marine Biology', ru: 'Морская биология' });
    if (bio.includes('anatomy')) subjects.push({ en: 'Human Anatomy', ru: 'Анатомия человека' });
    if (bio.includes('physiology')) subjects.push({ en: 'Physiology', ru: 'Физиология' });
    if (bio.includes('molecular')) subjects.push({ en: 'Molecular Biology', ru: 'Молекулярная биология' });
    if (bio.includes('medical')) subjects.push({ en: 'Medical Biology', ru: 'Медицинская биология' });
    if (subjects.length === 0) subjects.push({ en: 'Biology', ru: 'Биология' });
  }
  
  // Limit to 3 subjects max
  return subjects.slice(0, 3);
}

// Convert mock tutors to frontend format
const TEACHERS = MOCK_TUTORS.map((tutor, index) => ({
  photo: generateProfilePhoto(tutor.name, index),
  name: { 
    en: tutor.name, 
    ru: tutor.name // For simplicity, using English names for both languages
  },
  subject: tutor.subject,
  bio: {
    en: tutor.bio,
    ru: tutor.bio // For demo, using English bio for both languages
  },
  resume: {
    en: `${tutor.name} specializes in ${tutor.subject} and brings unique expertise to every lesson.`,
    ru: `${tutor.name} специализируется на ${tutor.subject} и привносит уникальный опыт в каждый урок.`
  },
  telegram: '#', // Placeholder for now
  // Enhanced data for detailed modal
  about: {
    en: `${tutor.bio} I've been tutoring for 2+ years and specialize in making complex concepts accessible through interactive learning. My teaching philosophy focuses on building confidence and fostering a love for learning through personalized approaches.`,
    ru: `${tutor.bio} Я преподаю уже более 2 лет и специализируюсь на том, чтобы делать сложные концепции доступными через интерактивное обучение. Моя философия преподавания сосредоточена на развитии уверенности и воспитании любви к обучению через персонализированные подходы.`
  },
  subjects: extractSubjects(tutor),
  teachingLanguages: {
    en: tutor.languagesSpoken ? tutor.languagesSpoken.join(', ') : 'English',
    ru: tutor.languagesSpoken ? tutor.languagesSpoken.join(', ') : 'English'
  },
  subjectsTaught: {
    en: capitalize(tutor.subject),
    ru: capitalize(tutor.subject)
  },
  teachingStyle: {
    en: tutor.teachingStyle ? capitalize(tutor.teachingStyle) : 'Interactive',
    ru: tutor.teachingStyle ? capitalize(tutor.teachingStyle) : 'Интерактивный'
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
  availability: generateAvailability(tutor.availableTime) // Convert real availability data
}));

// Global variable to track current modal tutor data
let currentModalTutor = null;

// Add global click handler to close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('tutor-profile-modal');
  const modalContainer = modal?.querySelector('.modal-container');
  
  // Only close if modal is open, click is outside container, and not on close button
  if (modal && !modal.classList.contains('hidden') && modalContainer && 
      !modalContainer.contains(e.target) && 
      !e.target.closest('#modal-close-btn')) {
    closeTutorProfileModal();
  }
});

// Add keyboard handler for ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('tutor-profile-modal');
    if (modal && !modal.classList.contains('hidden')) {
      e.preventDefault();
      closeTutorProfileModal();
    }
  }
});

// Additional event listener for close button and URL-based navigation
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTutorProfileModal();
    });
  }
  
  // Initialize section based on URL on page load
  const section = getCurrentSectionFromURL();
  console.log('Initializing app with section:', section);
  showSection(section, false); // Don't update URL on initial load
  
  // Add logging for debugging
  console.log('Navigation system initialized with URL persistence');
});

// --- Advanced Filtering System ---
let advancedFilters = {
  subject: '', // Single select - required
  availability: [], // Multi-select - days and time slots
  languages: [], // Multi-select - English, Russian
  hobbies: [] // Multi-select - optional for ranking
};

// Initialize advanced filter functionality
function initAdvancedFilters() {
  console.log('Initializing advanced filters...');
  
  // Initialize single-select subject filter
  const subjectFilter = document.getElementById('subject-filter');
  if (subjectFilter) {
    subjectFilter.addEventListener('change', () => {
      advancedFilters.subject = subjectFilter.value;
      updateFilterSummary();
      renderTeachers();
    });
  }
  
  // Initialize each multi-select dropdown
  initMultiSelectDropdown('availability', 'availability-filter');
  initMultiSelectDropdown('languages', 'language-filter');
  initMultiSelectDropdown('hobbies', 'hobby-filter');
  
  // Clear all filters button
  const clearBtn = document.getElementById('clear-all-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllFilters);
  }
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const dropdowns = ['availability', 'languages', 'hobbies'];
    dropdowns.forEach(type => {
      const dropdown = document.getElementById(`${type}-dropdown`);
      const button = document.getElementById(`${type}-dropdown-btn`);
      if (dropdown && button && !button.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
        button.querySelector('svg').classList.remove('rotate-180');
      }
    });
  });
}

function initMultiSelectDropdown(filterType, checkboxClass) {
  const button = document.getElementById(`${filterType}-dropdown-btn`);
  const dropdown = document.getElementById(`${filterType}-dropdown`);
  const display = document.getElementById(`${filterType}-display`);
  
  if (!button || !dropdown || !display) {
    console.error(`Missing elements for ${filterType} filter`);
    return;
  }
  
  // Toggle dropdown on button click
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = dropdown.classList.contains('hidden');
    
    // Close all other dropdowns
    ['availability', 'languages', 'hobbies'].forEach(type => {
      if (type !== filterType) {
        const otherDropdown = document.getElementById(`${type}-dropdown`);
        const otherBtn = document.getElementById(`${type}-dropdown-btn`);
        if (otherDropdown && otherBtn) {
          otherDropdown.classList.add('hidden');
          otherBtn.querySelector('svg').classList.remove('rotate-180');
        }
      }
    });
    
    // Toggle current dropdown
    if (isHidden) {
      dropdown.classList.remove('hidden');
      button.querySelector('svg').classList.add('rotate-180');
    } else {
      dropdown.classList.add('hidden');
      button.querySelector('svg').classList.remove('rotate-180');
    }
  });
  
  // Handle checkbox changes
  const checkboxes = dropdown.querySelectorAll(`.${checkboxClass}`);
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateFilterState(filterType, checkbox.value, checkbox.checked);
      updateDisplayText(filterType, display);
      updateFilterSummary();
      renderTeachers();
    });
  });
}

function updateFilterState(filterType, value, checked) {
  if (checked) {
    if (!advancedFilters[filterType].includes(value)) {
      advancedFilters[filterType].push(value);
    }
  } else {
    advancedFilters[filterType] = advancedFilters[filterType].filter(item => item !== value);
  }
  
  console.log(`Updated ${filterType} filters:`, advancedFilters[filterType]);
}

function updateDisplayText(filterType, display) {
  const selectedFilters = advancedFilters[filterType];
  const placeholders = {
    availability: { en: 'Select times...', ru: 'Выберите время...' },
    languages: { en: 'Select languages...', ru: 'Выберите языки...' },
    hobbies: { en: 'Select interests...', ru: 'Выберите интересы...' }
  };
  
  if (selectedFilters.length === 0) {
    display.textContent = placeholders[filterType][currentLang];
    display.classList.remove('text-cyan-300');
    display.classList.add('text-gray-400');
  } else if (selectedFilters.length === 1) {
    display.textContent = selectedFilters[0];
    display.classList.add('text-cyan-300');
    display.classList.remove('text-gray-400');
  } else {
    display.textContent = `${selectedFilters.length} selected`;
    display.classList.add('text-cyan-300');
    display.classList.remove('text-gray-400');
  }
}

function updateFilterSummary() {
  const summary = document.getElementById('filter-summary');
  const activeFiltersContainer = document.getElementById('active-filters');
  
  if (!summary || !activeFiltersContainer) return;
  
  const allActiveFilters = [];
  
  // Add subject filter if selected
  if (advancedFilters.subject) {
    allActiveFilters.push({ type: 'subject', value: advancedFilters.subject });
  }
  
  // Add other filters
  advancedFilters.availability.forEach(a => allActiveFilters.push({ type: 'availability', value: a }));
  advancedFilters.languages.forEach(l => allActiveFilters.push({ type: 'language', value: l }));
  advancedFilters.hobbies.forEach(h => allActiveFilters.push({ type: 'hobby', value: h }));
  
  if (allActiveFilters.length === 0) {
    summary.classList.add('hidden');
    return;
  }
  
  summary.classList.remove('hidden');
  activeFiltersContainer.innerHTML = '';
  
  allActiveFilters.forEach(filter => {
    const tag = document.createElement('span');
    tag.className = 'inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs border border-cyan-400/30';
    
    const icons = {
      subject: '📚',
      availability: '⏰',
      language: '🌍',
      hobby: '🎯'
    };
    
    tag.innerHTML = `
      ${icons[filter.type]} ${filter.value}
      <button onclick="removeFilter('${filter.type}', '${filter.value}')" class="ml-1 text-cyan-400 hover:text-white">×</button>
    `;
    
    activeFiltersContainer.appendChild(tag);
  });
}

function removeFilter(type, value) {
  if (type === 'subject') {
    advancedFilters.subject = '';
    const subjectFilter = document.getElementById('subject-filter');
    if (subjectFilter) subjectFilter.value = '';
  } else {
    const filterTypeMap = {
      availability: 'availability',
      language: 'languages',
      hobby: 'hobbies'
    };
    
    const filterType = filterTypeMap[type];
    if (!filterType) return;
    
    // Remove from filter state
    advancedFilters[filterType] = advancedFilters[filterType].filter(item => item !== value);
    
    // Uncheck the corresponding checkbox
    const checkboxClass = {
      availability: 'availability-filter',
      languages: 'language-filter',
      hobbies: 'hobby-filter'
    };
    
    const checkbox = document.querySelector(`.${checkboxClass[filterType]}[value="${value}"]`);
    if (checkbox) {
      checkbox.checked = false;
    }
    
    // Update display text
    const display = document.getElementById(`${filterType}-display`);
    if (display) {
      updateDisplayText(filterType, display);
    }
  }
  
  updateFilterSummary();
  renderTeachers();
}

// Make removeFilter available globally
window.removeFilter = removeFilter;

function clearAllFilters() {
  console.log('Clearing all filters...');
  
  // Reset filter state
  advancedFilters = {
    subject: '',
    availability: [],
    languages: [],
    hobbies: []
  };
  
  // Reset subject filter
  const subjectFilter = document.getElementById('subject-filter');
  if (subjectFilter) subjectFilter.value = '';
  
  // Uncheck all checkboxes
  document.querySelectorAll('.availability-filter, .language-filter, .hobby-filter').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Reset display texts
  ['availability', 'languages', 'hobbies'].forEach(filterType => {
    const display = document.getElementById(`${filterType}-display`);
    if (display) {
      updateDisplayText(filterType, display);
    }
  });
  
  // Hide summary and re-render
  updateFilterSummary();
  renderTeachers();
}

// New matching functions for the advanced filter system
function matchesSubject(tutor, selectedSubject) {
  if (!selectedSubject) return false; // Subject is mandatory
  
  // ✅ FIXED: Direct subject matching - no more cross-subject leakage
  // Only return tutors that exactly match the selected subject
  return tutor.subject === selectedSubject;
}

function matchesAvailability(tutor, selectedTimes) {
  if (!selectedTimes.length) return true;
  
  // Get the original tutor data for availability checking
  const originalTutor = MOCK_TUTORS.find(mt => mt.name === tutor.name[currentLang]);
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
  const originalTutor = MOCK_TUTORS.find(mt => mt.name === tutor.name[currentLang]);
  if (!originalTutor) return false;
  
  const tutorLanguages = originalTutor.languagesSpoken || ['English'];
  
  return selectedLanguages.some(lang => 
    tutorLanguages.some(tutorLang => 
      tutorLang.toLowerCase().includes(lang.toLowerCase())
    )
  );
}

function matchesHobbies(tutor, selectedHobbies) {
  if (!selectedHobbies.length) return true;
  
  // Get the original tutor data for hobby checking
  const originalTutor = MOCK_TUTORS.find(mt => mt.name === tutor.name[currentLang]);
  if (!originalTutor) return false;
  
  const tutorHobbies = originalTutor.hobbies || [];
  
  return selectedHobbies.some(hobby => 
    tutorHobbies.some(tutorHobby => 
      tutorHobby.toLowerCase().includes(hobby.toLowerCase())
    )
  );
}

// Calculate hobby matching score for ranking
function calculateHobbyMatchScore(tutor, selectedHobbies) {
  if (!selectedHobbies.length) return 0;
  
  const originalTutor = MOCK_TUTORS.find(mt => mt.name === tutor.name[currentLang]);
  if (!originalTutor) return 0;
  
  const tutorHobbies = originalTutor.hobbies || [];
  const matches = selectedHobbies.filter(hobby => 
    tutorHobbies.some(tutorHobby => 
      tutorHobby.toLowerCase().includes(hobby.toLowerCase())
    )
  );
  
  return matches.length / selectedHobbies.length; // Returns 0-1 score
}

// NEW: Enhanced teacher card rendering with more effects
function renderTeachers() {
  const grid = document.getElementById('teachers-grid');
  if (!grid) return;
  
  console.log('Rendering teachers with enhanced effects...');
  
  // Start with all teachers
  let filtered = [...TEACHERS];
  
  // Apply filters (existing logic)
  if (advancedFilters.subject) {
    filtered = filtered.filter(t => matchesSubject(t, advancedFilters.subject));
  }
  // REMOVED: No longer require subject selection - show all teachers by default
  
  // Apply other filters (existing logic)
  if (advancedFilters.availability.length > 0) {
    filtered = filtered.filter(t => matchesAvailability(t, advancedFilters.availability));
  }
  
  if (advancedFilters.languages.length > 0) {
    filtered = filtered.filter(t => matchesLanguages(t, advancedFilters.languages));
  }
  
  if (advancedFilters.hobbies.length > 0) {
    const tutorsWithHobbies = filtered.filter(t => matchesHobbies(t, advancedFilters.hobbies));
    const tutorsWithoutHobbies = filtered.filter(t => !matchesHobbies(t, advancedFilters.hobbies));
    
    tutorsWithHobbies.sort((a, b) => {
      const scoreA = calculateHobbyMatchScore(a, advancedFilters.hobbies);
      const scoreB = calculateHobbyMatchScore(b, advancedFilters.hobbies);
      return scoreB - scoreA;
    });
    
    filtered = [...tutorsWithHobbies, ...tutorsWithoutHobbies];
  } else {
    filtered.sort((a, b) => a.name[currentLang].localeCompare(b.name[currentLang]));
  }
  
  // Clear existing content
  grid.innerHTML = '';
  
  // Show filter results count if filters are applied
  const hasActiveFilters = advancedFilters.subject || advancedFilters.availability.length > 0 || 
                          advancedFilters.languages.length > 0 || advancedFilters.hobbies.length > 0;
  
  if (hasActiveFilters && filtered.length > 0) {
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'col-span-full text-center mb-6';
    resultsDiv.innerHTML = `
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full border border-cyan-400/30">
        <span class="text-cyan-300 font-semibold">${filtered.length}</span>
        <span class="text-gray-300">
          ${currentLang === 'en' ? 'tutors found' : 'преподавателей найдено'}
        </span>
        <span class="text-cyan-400 sparkle">✨</span>
      </div>
    `;
    grid.appendChild(resultsDiv);
  }
  
  // Render filtered tutors with enhanced effects
  filtered.forEach((t, idx) => {
    const card = document.createElement('div');
    card.className = 'teacher-card bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 ease-in-out transform opacity-0 scale-95 cursor-pointer select-none hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-cyan-400/50 particle-trail sparkle';
    card.setAttribute('data-tutor-id', idx);
    
    // Calculate hobby match score for display
    let hobbyMatchInfo = '';
    if (advancedFilters.hobbies.length > 0) {
      const score = calculateHobbyMatchScore(t, advancedFilters.hobbies);
      if (score > 0) {
        const percentage = Math.round(score * 100);
        hobbyMatchInfo = `<div class="text-xs text-green-400 mt-1 neon-glow">🎯 ${percentage}% hobby match</div>`;
      }
    }
    
    // Create enhanced card content with new effects
    card.innerHTML = `
      <img src="${t.photo}" alt="${t.name[currentLang]}" class="w-24 h-24 rounded-full mb-3 object-cover border-4 border-cyan-400 select-none pointer-events-none float-animation"/>
      <div class="font-bold text-lg mb-1 select-none pointer-events-none gradient-text">${t.name[currentLang]}</div>
      <div class="text-cyan-200 text-sm mb-2 select-none pointer-events-none neon-glow">${capitalize(t.subject)}</div>
      <div class="text-sm text-center mb-2 select-none pointer-events-none line-clamp-2 text-reveal">${t.bio[currentLang]}</div>
      <div class="text-xs text-gray-400 text-center select-none pointer-events-none">
        ${t.teachingLanguages[currentLang]}
      </div>
      ${hobbyMatchInfo}
    `;
    
    // Add click handler to open modal
    card.onclick = (e) => {
      e.stopPropagation();
      openTutorProfileModal(t);
    };
    
    grid.appendChild(card);
    
    // Enhanced staggered entrance animation with new effects
    setTimeout(() => {
      card.classList.remove('opacity-0', 'scale-95');
      card.classList.add('opacity-100', 'scale-100', 'teacher-card-entrance');
      
      // Add floating animation after entrance
      setTimeout(() => {
        card.classList.add('float-animation');
      }, 400);
    }, idx * 120);
  });
}

// Function to filter and display matched tutors from AI
function filterAndDisplayMatchedTutors(tutorIds) {
  console.log('[AI Filter] Filtering tutors by IDs:', tutorIds);
  
  const grid = document.getElementById('teachers-grid');
  if (!grid) {
    console.error('[AI Filter] Teachers grid not found');
    return;
  }
  
  // Clear existing content
  grid.innerHTML = '';
  
  // Add heading for matched tutors
  const headingDiv = document.createElement('div');
  headingDiv.className = 'col-span-full text-center mb-6';
  headingDiv.innerHTML = `
    <h3 class="text-2xl font-bold text-cyan-300 mb-2">🎯 Based on your request, here are the top ${tutorIds.length} tutor matches:</h3>
    <p class="text-gray-400">Click on any tutor card to view their full profile</p>
  `;
  grid.appendChild(headingDiv);
  
  // Filter tutors by the provided IDs (convert tutor names to matching format)
  const matchedTutors = TEACHERS.filter(tutor => {
    const tutorName = tutor.name[currentLang];
    // Convert tutor name to same format as backend: lowercase, replace non-letters with hyphens
    const tutorId = tutorName.toLowerCase().replace(/[^a-z]/g, '-');
    const isMatch = tutorIds.includes(tutorId);
    console.log(`[AI Filter] Checking tutor "${tutorName}" -> ID: "${tutorId}" -> Match: ${isMatch}`);
    
    return isMatch;
  });
  
  console.log('[AI Filter] Found matched tutors:', matchedTutors.map(t => t.name[currentLang]));
  
  // Render only the matched tutors
  if (matchedTutors.length === 0) {
    // No tutors found
    const noResultsDiv = document.createElement('div');
    noResultsDiv.className = 'col-span-full text-center py-8';
    noResultsDiv.innerHTML = `
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
        </svg>
        <p class="text-lg font-semibold text-gray-300">No tutors found matching your criteria</p>
        <p class="text-sm text-gray-500 mt-2">Try adjusting your preferences or check back later</p>
      </div>
    `;
    grid.appendChild(noResultsDiv);
  } else {
    // Use the exact same card structure as renderTeachers()
    matchedTutors.forEach((t, idx) => {
      const card = document.createElement('div');
      card.className = 'teacher-card bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center transition-all duration-300 ease-in-out transform opacity-0 scale-95 cursor-pointer select-none';
      card.setAttribute('data-tutor-id', idx);
      
      // Create simple card content - EXACTLY the same as renderTeachers()
      card.innerHTML = `
        <img src="${t.photo}" alt="${t.name[currentLang]}" class="w-24 h-24 rounded-full mb-3 object-cover border-4 border-cyan-400 select-none pointer-events-none"/>
        <div class="font-bold text-lg mb-1 select-none pointer-events-none">${t.name[currentLang]}</div>
        <div class="text-cyan-200 text-sm mb-2 select-none pointer-events-none">${capitalize(t.subject)}</div>
        <div class="text-sm text-center mb-2 select-none pointer-events-none line-clamp-2">${t.bio[currentLang]}</div>
      `;
      
      // Add click handler to open modal
      card.onclick = (e) => {
        e.stopPropagation();
        openTutorProfileModal(t);
      };
      
      grid.appendChild(card);
      
      // Staggered entrance animation - same as renderTeachers()
      setTimeout(() => {
        card.classList.remove('opacity-0', 'scale-95');
        card.classList.add('opacity-100', 'scale-100', 'teacher-card-entrance');
      }, idx * 120);
    });
  }
  
  // Add a "Show All Tutors" button
  const showAllDiv = document.createElement('div');
  showAllDiv.className = 'col-span-full text-center mt-8';
  showAllDiv.innerHTML = `
    <button onclick="showAllTutors()" class="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg border border-cyan-400/30">
      <span class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
        Show All Tutors
      </span>
    </button>
  `;
  grid.appendChild(showAllDiv);
  
  // Scroll to the teachers section
  setTimeout(() => {
    document.getElementById('section-teachers').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Function to show all tutors (reset filter)
window.showAllTutors = function() {
  console.log('[AI Filter] Showing all tutors');
  renderTeachers();
  
  // Reset any active filters
  const subjectFilter = document.getElementById('subject-filter');
  const availabilityCheckboxes = document.querySelectorAll('.availability-filter');
  const languageCheckboxes = document.querySelectorAll('.language-filter');
  const hobbyCheckboxes = document.querySelectorAll('.hobby-filter');
  
  if (subjectFilter) subjectFilter.value = '';
  availabilityCheckboxes.forEach(cb => cb.checked = false);
  languageCheckboxes.forEach(cb => cb.checked = false);
  hobbyCheckboxes.forEach(cb => cb.checked = false);
  
  // Update filter displays
  updateFilterDisplays();
  hideFilterSummary();
};

// Modal Functions
function openTutorProfileModal(tutor) {
  console.log('Opening tutor profile modal for:', tutor.name);
  currentModalTutor = tutor;
  const modal = document.getElementById('tutor-profile-modal');
  const modalContainer = modal?.querySelector('.modal-container');
  
  if (!modal || !modalContainer) {
    console.error('Modal elements not found');
    return;
  }
  
  // Populate modal content
  populateModalContent(tutor);
  
  // Show modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  // Trigger smooth animation
  requestAnimationFrame(() => {
    modalContainer.classList.add('modal-open');
  });
  
  // Focus the close button for accessibility
  setTimeout(() => {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.focus();
    }
  }, 100);
}

// Make closeTutorProfileModal globally accessible
window.closeTutorProfileModal = function() {
  console.log('🔥 Closing tutor profile modal');
  const modal = document.getElementById('tutor-profile-modal');
  const modalContainer = modal?.querySelector('.modal-container');
  
  if (!modal || !modalContainer) {
    console.error('Modal elements not found');
    return;
  }
  
  // Prevent closing if already hidden
  if (modal.classList.contains('hidden')) {
    console.log('Modal already hidden');
    return;
  }
  
  // Hide modal instantly - no animation delay
  modal.classList.add('hidden');
  modalContainer.classList.remove('modal-open', 'modal-closing');
  document.body.style.overflow = ''; // Restore scroll
  currentModalTutor = null;
  console.log('✅ Modal closed successfully');
};

function populateModalContent(tutor) {
  console.log('Populating modal with:', tutor);
  
  // Header content
  const photo = document.getElementById('modal-tutor-photo');
  const name = document.getElementById('modal-tutor-name');
  const subjectBadge = document.getElementById('modal-tutor-subject-badge');
  
  if (!photo || !name || !subjectBadge) {
    console.error('Modal elements not found:', { photo, name, subjectBadge });
    return;
  }
  
  photo.src = tutor.photo;
  photo.alt = tutor.name[currentLang];
  name.textContent = tutor.name[currentLang];
  
  // Set subject badge with styling
  subjectBadge.textContent = capitalize(tutor.subject);
  subjectBadge.className = `px-4 py-1 rounded-full text-sm font-semibold ${tutor.subject}`;
  
  console.log('Header populated successfully');
  
  // About section
  document.getElementById('modal-tutor-about').textContent = tutor.about[currentLang];
  
  // Teaching Information
  document.getElementById('modal-tutor-languages').textContent = tutor.teachingLanguages[currentLang];
  document.getElementById('modal-tutor-subjects-taught').textContent = tutor.subjectsTaught[currentLang];
  document.getElementById('modal-tutor-teaching-style').textContent = tutor.teachingStyle[currentLang];
  document.getElementById('modal-tutor-experience').textContent = tutor.experience[currentLang];
  
  // Subjects
  const subjectsContainer = document.getElementById('modal-tutor-subjects');
  subjectsContainer.innerHTML = '';
  tutor.subjects.forEach(subject => {
    const tag = document.createElement('span');
    tag.className = 'subject-tag-modal';
    tag.textContent = subject[currentLang];
    subjectsContainer.appendChild(tag);
  });
  
  // Schedule
  document.getElementById('modal-schedule-table').innerHTML = generateRedesignedScheduleTable(tutor.availability);
  
  // Hobbies with icons
  const hobbiesContainer = document.getElementById('modal-tutor-hobbies');
  hobbiesContainer.innerHTML = '';
  if (tutor.hobbies[currentLang]) {
    const hobbyIcons = {
      'chess': '♟️',
      'programming': '💻',
      'hiking': '🏔️',
      'data analysis': '📊',
      'basketball': '🏀',
      'cooking': '👨‍🍳',
      'drawing': '🎨',
      'yoga': '🧘',
      'photography': '📸',
      'puzzle solving': '🧩',
      'reading': '📚',
      'board games': '🎲',
      'theater': '🎭',
      'gardening': '🌱',
      'robotics': '🤖',
      'rock climbing': '🧗',
      'music production': '🎵',
      'meditation': '🧘‍♀️',
      'travel': '✈️',
      'swimming': '🏊',
      'video games': '🎮',
      'anime': '📺',
      'table tennis': '🏓',
      'soccer': '⚽',
      'guitar': '🎸',
      'speedcubing': '🧊',
      'running': '🏃',
      'blogging': '✍️',
      'research': '🔬',
      'martial arts': '🥋',
      'coding': '💻',
      'origami': '🦢',
      'test prep': '📝',
      'violin': '🎻',
      'debate': '🗣️',
      'writing': '✍️',
      'coffee culture': '☕',
      'languages': '🌍',
      'crossword puzzles': '📖',
      'tea': '🍵',
      'mentoring': '👥',
      'golf': '⛳',
      'journalism': '📰',
      'poetry': '📜',
      'art': '🎨',
      'music': '🎼',
      'networking': '🤝',
      'public speaking': '🎤',
      'tennis': '🎾',
      'book clubs': '📖',
      'volunteering': '🤲',
      'podcasting': '🎙️',
      'cycling': '🚴'
    };
    
    tutor.hobbies[currentLang].split(', ').forEach(hobby => {
      const hobbyItem = document.createElement('div');
      hobbyItem.className = 'flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors duration-200';
      
      const icon = document.createElement('span');
      icon.className = 'text-xl';
      icon.textContent = hobbyIcons[hobby.trim().toLowerCase()] || '🎯';
      
      const text = document.createElement('span');
      text.className = 'text-gray-300 font-medium';
      text.textContent = hobby.trim();
      
      hobbyItem.appendChild(icon);
      hobbyItem.appendChild(text);
      hobbiesContainer.appendChild(hobbyItem);
    });
  }
}

function generateRedesignedScheduleTable(availability) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysRu = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const times = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  
  // Convert availability array to schedule format
  const schedule = {};
  days.forEach((day, dayIndex) => {
    schedule[day] = {};
    times.forEach((time, timeIndex) => {
      const slotIndex = dayIndex * times.length + timeIndex + 1; // FIXED: Removed incorrect modulo 30
      schedule[day][time] = availability.includes(slotIndex);
    });
  });

  let tableHTML = `
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th class="p-3 text-center font-semibold text-cyan-300 border-b border-gray-600 bg-gray-700/30" style="min-width: 80px;">${currentLang === 'ru' ? 'Время' : 'Time'}</th>
          ${days.map((day, index) => `
            <th class="p-3 text-center font-semibold text-cyan-300 border-b border-gray-600 bg-gray-700/30" style="min-width: 60px;">${currentLang === 'ru' ? daysRu[index] : day}</th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  times.forEach(time => {
    tableHTML += `<tr>`;
    tableHTML += `<td class="p-3 text-center font-semibold text-cyan-300 border-b border-gray-600 bg-gray-700/20" style="min-width: 80px;">${time}</td>`;
    days.forEach(day => {
      const isAvailable = schedule[day][time];
      const cellClass = isAvailable ? 'available' : 'unavailable';
      const content = isAvailable ? '✅' : '⛔';
      const title = isAvailable ? `${currentLang === 'ru' ? 'Доступно' : 'Available'} ${currentLang === 'ru' ? daysRu[days.indexOf(day)] : day} ${time}` : `${currentLang === 'ru' ? 'Недоступно' : 'Not available'} ${currentLang === 'ru' ? daysRu[days.indexOf(day)] : day} ${time}`;
      tableHTML += `<td class="${cellClass} p-3 text-center border-b border-gray-600 transition-all duration-200 hover:bg-gray-700/30" style="min-width: 60px;" title="${title}">${content}</td>`;
    });
    tableHTML += `</tr>`;
  });
  
  tableHTML += `</tbody></table>`;
  return tableHTML;
}

// Keep the old function for backward compatibility
function generateModalScheduleTable(availability) {
  return generateRedesignedScheduleTable(availability);
}

function contactTutorFromModal() {
  if (currentModalTutor) {
    contactTutor(currentModalTutor.name[currentLang], currentModalTutor.telegram);
  }
}

// Modal functionality complete

function contactTutor(name, telegramLink) {
  // For demo purposes, show an alert. In production, this would open Telegram
  if (telegramLink && telegramLink !== '#') {
    window.open(telegramLink, '_blank');
  } else {
    alert(`Contact ${name} via Telegram\n\n(This would open their Telegram profile in a real application)`);
  }
}
function capitalize(str) {
  if (!str) return '';
  return currentLang === 'ru'
    ? { 
        math: 'Математика', 
        english: 'Английский', 
        physics: 'Физика',
        chemistry: 'Химия',
        biology: 'Биология'
      }[str] || str
    : str.charAt(0).toUpperCase() + str.slice(1);
}


// --- Teacher Modal ---
function openTeacherModal(teacher) {
  document.body.classList.add('modal-open');
  document.getElementById('teacher-modal-bg').classList.remove('hidden');
  document.getElementById('modal-photo').src = teacher.photo;
  document.getElementById('modal-name').textContent = teacher.name[currentLang];
  document.getElementById('modal-bio').textContent = teacher.bio[currentLang];
  document.getElementById('modal-resume').textContent = teacher.resume[currentLang];
  document.getElementById('modal-telegram').href = teacher.telegram;
}
document.getElementById('close-modal').onclick = () => {
  document.body.classList.remove('modal-open');
  document.getElementById('teacher-modal-bg').classList.add('hidden');
};
document.getElementById('teacher-modal-bg').onclick = (e) => {
  if (e.target === e.currentTarget) document.getElementById('close-modal').onclick();
};

// --- Detailed Tutor Modal ---
function openDetailedTutorModal(teacher) {
  const modalBg = document.getElementById('detailed-tutor-modal-bg');
  const modal = document.getElementById('detailed-tutor-modal');
  
  // Populate modal content
  document.getElementById('detailed-photo').src = teacher.photo;
  document.getElementById('detailed-name').textContent = teacher.name[currentLang];
  document.getElementById('detailed-subject').textContent = capitalize(teacher.subject);
  document.getElementById('detailed-about').textContent = teacher.about[currentLang];
  document.getElementById('detailed-experience').textContent = teacher.experience[currentLang];
  document.getElementById('detailed-telegram').href = teacher.telegram;
  
  // Populate new fields
  const languagesElement = document.getElementById('detailed-languages');
  const subjectsTaughtElement = document.getElementById('detailed-subjects-taught');
  const teachingStyleElement = document.getElementById('detailed-teaching-style');
  
  if (languagesElement) languagesElement.textContent = teacher.teachingLanguages[currentLang];
  if (subjectsTaughtElement) subjectsTaughtElement.textContent = teacher.subjectsTaught[currentLang];
  if (teachingStyleElement) teachingStyleElement.textContent = teacher.teachingStyle[currentLang];
  
  // Populate subjects
  const subjectsContainer = document.getElementById('detailed-subjects');
  subjectsContainer.innerHTML = '';
  teacher.subjects.forEach(subject => {
    const badge = document.createElement('span');
    badge.className = 'bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-400/30';
    badge.textContent = subject[currentLang];
    subjectsContainer.appendChild(badge);
  });
  
  // Populate hobbies with icons
  const hobbiesElement = document.getElementById('detailed-hobbies');
  if (hobbiesElement && teacher.hobbies[currentLang]) {
    const hobbyIcons = {
      'chess': '♟️',
      'programming': '💻',
      'hiking': '🏔️',
      'data analysis': '📊',
      'basketball': '🏀',
      'cooking': '👨‍🍳',
      'drawing': '🎨',
      'yoga': '🧘',
      'photography': '📸',
      'puzzle solving': '🧩',
      'reading': '📚',
      'board games': '🎲',
      'theater': '🎭',
      'gardening': '🌱',
      'robotics': '🤖',
      'rock climbing': '🧗',
      'music production': '🎵',
      'meditation': '🧘‍♀️',
      'travel': '✈️',
      'swimming': '🏊',
      'video games': '🎮',
      'anime': '📺',
      'table tennis': '🏓',
      'soccer': '⚽',
      'guitar': '🎸',
      'speedcubing': '🧊',
      'running': '🏃',
      'blogging': '✍️',
      'research': '🔬',
      'martial arts': '🥋',
      'coding': '💻',
      'origami': '🦢',
      'test prep': '📝',
      'violin': '🎻',
      'debate': '🗣️',
      'writing': '✍️',
      'coffee culture': '☕',
      'languages': '🌍',
      'crossword puzzles': '📖',
      'tea': '🍵',
      'mentoring': '👥',
      'golf': '⛳',
      'journalism': '📰',
      'poetry': '📜',
      'art': '🎨',
      'music': '🎼',
      'networking': '🤝',
      'public speaking': '🎤',
      'tennis': '🎾',
      'book clubs': '📖',
      'volunteering': '🤲',
      'podcasting': '🎙️',
      'cycling': '🚴'
    };
    
    const hobbiesList = document.createElement('div');
    hobbiesList.className = 'space-y-2';
    
    teacher.hobbies[currentLang].split(', ').forEach(hobby => {
      const hobbyItem = document.createElement('div');
      hobbyItem.className = 'flex items-center gap-2 text-sm';
      
      const icon = document.createElement('span');
      icon.textContent = hobbyIcons[hobby.trim().toLowerCase()] || '🎯';
      
      const text = document.createElement('span');
      text.textContent = hobby.trim();
      text.className = 'text-gray-300';
      
      hobbyItem.appendChild(icon);
      hobbyItem.appendChild(text);
      hobbiesList.appendChild(hobbyItem);
    });
    
    hobbiesElement.innerHTML = '';
    hobbiesElement.appendChild(hobbiesList);
  }
  
  // Generate schedule
  generateDetailedSchedule(teacher.availability);
  
  // Show modal with enhanced animation
  modalBg.classList.remove('hidden');
  document.body.classList.add('modal-open');
  
  // Enhanced entrance animation with backdrop blur
  setTimeout(() => {
    modal.classList.remove('scale-95', 'opacity-0');
    modal.classList.add('scale-100', 'opacity-100');
  }, 10);
  
  // Ensure modal is scrollable if content is too tall
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';
  
  // Update language-specific content
  updateDetailedModalLang();
  
  // Add mobile responsiveness
  if (window.innerWidth < 768) {
    modal.classList.add('mx-2', 'my-4');
  }
}

function closeDetailedTutorModal() {
  const modalBg = document.getElementById('detailed-tutor-modal-bg');
  const modal = document.getElementById('detailed-tutor-modal');
  
  // Trigger exit animation
  modal.classList.add('scale-95', 'opacity-0');
  modal.classList.remove('scale-100', 'opacity-100');
  
  setTimeout(() => {
    modalBg.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }, 500);
}

function generateDetailedSchedule(availability) {
  const scheduleTbody = document.getElementById('schedule-tbody');
  if (!scheduleTbody) return;
  
  scheduleTbody.innerHTML = '';
  
  // Generate time slots from 15:00 to 22:00
  const timeSlots = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
  timeSlots.forEach(time => {
    const row = document.createElement('tr');
    
    // Time column
    const timeCell = document.createElement('td');
    timeCell.className = 'p-2 text-center font-semibold text-cyan-300 border-b border-gray-600 bg-gray-700/20';
    timeCell.textContent = time;
    row.appendChild(timeCell);
    
    // Day columns
    daysOfWeek.forEach(day => {
      const cell = document.createElement('td');
      cell.className = 'p-2 text-center border-b border-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-700/50 hover:scale-105';
      
      // Simulate availability (random for demo)
      const isAvailable = Math.random() > 0.5;
      
      if (isAvailable) {
        cell.innerHTML = '✅';
        cell.classList.add('text-green-400', 'font-bold', 'bg-green-500/10');
        cell.title = currentLang === 'ru' ? 'Доступно' : 'Available';
      } else {
        cell.innerHTML = '⛔';
        cell.classList.add('text-red-400', 'font-bold', 'bg-red-500/10');
        cell.title = currentLang === 'ru' ? 'Недоступно' : 'Not available';
      }
      
      // Add click interaction
      cell.addEventListener('click', () => {
        if (isAvailable) {
          cell.classList.add('animate-pulse-glow');
          setTimeout(() => cell.classList.remove('animate-pulse-glow'), 600);
        }
      });
      
      row.appendChild(cell);
    });
    
    scheduleTbody.appendChild(row);
  });
}

function updateDetailedModalLang() {
  // Update all translatable content in the detailed modal
  document.querySelectorAll('#detailed-tutor-modal [data-en]').forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
  
  // Update schedule table headers
  const scheduleTable = document.getElementById('detailed-schedule');
  if (scheduleTable) {
    const dayHeaders = scheduleTable.querySelectorAll('th[data-en]');
    dayHeaders.forEach(header => {
      header.textContent = header.dataset[currentLang];
    });
  }
}

function updateFAQLang() {
  // Update all translatable content in the FAQ section
  document.querySelectorAll('#section-faq [data-en]').forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
}

// Event listeners for detailed modal
document.getElementById('close-detailed-modal').onclick = closeDetailedTutorModal;
document.getElementById('detailed-tutor-modal-bg').onclick = (e) => {
  if (e.target === e.currentTarget) closeDetailedTutorModal();
};

// Remove book-session button logic from detailed modal

// --- FAQ Accordion Functionality ---
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const arrow = item.querySelector('.faq-arrow');
    
    if (!question || !answer || !arrow) return;
    
    // Set initial state
    answer.style.maxHeight = '0px';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.3s ease-in-out';
    arrow.style.transition = 'transform 0.3s ease-in-out';
    
    question.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
      
      // Close all other items smoothly
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherArrow = otherItem.querySelector('.faq-arrow');
          if (otherAnswer && otherArrow) {
            otherAnswer.style.maxHeight = '0px';
            otherArrow.style.transform = 'rotate(0deg)';
            otherItem.classList.remove('ring-2', 'ring-cyan-400/50');
          }
        }
      });
      
      // Toggle current item smoothly
      if (!isOpen) {
        // Open the item
        answer.style.maxHeight = answer.scrollHeight + 'px';
        arrow.style.transform = 'rotate(180deg)';
        item.classList.add('ring-2', 'ring-cyan-400/50');
      } else {
        // Close the item
        answer.style.maxHeight = '0px';
        arrow.style.transform = 'rotate(0deg)';
        item.classList.remove('ring-2', 'ring-cyan-400/50');
      }
    });
  });
}

// --- Visual Enhancements ---

// Enhanced Navigation with Glow Effect
function enhanceNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  
  navBtns.forEach(btn => {
    // Add glow effect on hover
    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 0 20px rgba(34, 211, 238, 0.3)';
      btn.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = '';
      btn.style.transform = '';
    });
    
    // Add underline animation
    btn.addEventListener('click', () => {
      // Remove underline from all buttons
      navBtns.forEach(b => b.classList.remove('border-b-2', 'border-cyan-400'));
      // Add underline to clicked button
      btn.classList.add('border-b-2', 'border-cyan-400');
    });
  });
}

// Convert buttons to gradient glowing buttons
function enhanceButtons() {
  const primaryButtons = document.querySelectorAll('#detailed-telegram');
  
  primaryButtons.forEach(btn => {
    if (!btn.classList.contains('gradient-enhanced')) {
      btn.classList.add('gradient-enhanced', 'bg-gradient-to-r', 'from-cyan-500', 'to-purple-600', 'hover:from-cyan-400', 'hover:to-purple-500', 'animate-pulse', 'hover:animate-none', 'hover:scale-105', 'transition-all', 'duration-300', 'shadow-lg', 'hover:shadow-xl', 'hover:shadow-cyan-500/25');
    }
  });
}

// Scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe sections for fade-in animation
  document.querySelectorAll('section').forEach(section => {
    section.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700');
    observer.observe(section);
  });
  
  // Observe cards and other elements
  document.querySelectorAll('.faq-item, .bg-gray-800').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-500');
    observer.observe(el);
  });
}



// Enhanced interactive elements
function enhanceInteractiveElements() {
  // Teacher cards hover effects
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('#teachers-grid > div')) {
      const card = e.target.closest('#teachers-grid > div');
      card.style.transform = 'scale(1.02) translateY(-4px)';
      card.style.boxShadow = '0 10px 25px rgba(34, 211, 238, 0.2)';
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('#teachers-grid > div')) {
      const card = e.target.closest('#teachers-grid > div');
      card.style.transform = '';
      card.style.boxShadow = '';
    }
  });
  
  // Calendar cells enhanced effects
  document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('calendar-day') && !e.target.disabled) {
      e.target.style.transform = 'scale(1.1) rotate(2deg)';
      e.target.style.boxShadow = '0 4px 12px rgba(34, 211, 238, 0.3)';
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('calendar-day')) {
      e.target.style.transform = '';
      e.target.style.boxShadow = '';
    }
  });
}

// Add custom CSS animations
function addCustomAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateX(-100%) skewX(-12deg); }
      100% { transform: translateX(200%) skewX(-12deg); }
    }
    
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
      50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.5); }
    }
    
    .animate-shimmer {
      animation: shimmer 1.5s infinite;
    }
    
    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
    }
    
    .animate-pulse-glow {
      animation: pulse-glow 2s infinite;
    }
    
    .gradient-enhanced {
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }
    
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `;
  document.head.appendChild(style);
}

// Initialize all enhancements
function initVisualEnhancements() {
  enhanceNavigation();
  enhanceButtons();
  initScrollAnimations();
  enhanceInteractiveElements();
  addCustomAnimations();
  initFAQAccordion();
  
  // NEW: Apply new dynamic effects
  applyNewDynamicEffects();
  
  // NEW: Initialize flying cap animation
  initFlyingCapAnimation();
}

// NEW: Flying cap animation
function initFlyingCapAnimation() {
  console.log('Initializing flying cap animation...');
  
  const logoFly = document.getElementById('logo-fly');
  const heroTitle = document.querySelector('#hero-title');
  const navTitle = document.querySelector('#nav-title');
  
  if (!logoFly || !heroTitle || !navTitle) {
    console.error('Flying cap elements not found');
    return;
  }
  
  console.log('Found elements:', { logoFly, heroTitle, navTitle });
  
  // Position cap centered above the "Mentora: Student Volunteers for Kyrgyzstan" heading
  const titleRect = heroTitle.getBoundingClientRect();
  const centerX = titleRect.left + (titleRect.width / 2) - 64; // 64 = half of 128px width
  const centerY = titleRect.top - 100; // 100px above the heading
  
  logoFly.style.left = centerX + 'px';
  logoFly.style.top = centerY + 'px';
  logoFly.style.transform = 'scale(1) rotate(0deg)';
  
  console.log('Cap positioned above heading:', { centerX, centerY, titleRect });
  
  // Start animation after a short delay
  setTimeout(() => {
    animateCapToNav();
  }, 500);
}

// Test function for debugging
function testAnimation() {
  console.log('Test animation triggered manually');
  
  // Reset the page state
  document.body.classList.remove('logo-flying');
  
  // Remove cap from nav if it exists
  const existingCap = document.querySelector('#nav-logo .w-8');
  if (existingCap) {
    existingCap.remove();
  }
  
  // Recreate flying cap
  const logoFly = document.getElementById('logo-fly');
  if (logoFly) {
    logoFly.className = 'w-32 h-32 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl absolute z-50';
    logoFly.style.position = 'absolute';
    logoFly.style.zIndex = '50';
    logoFly.style.transform = 'scale(1) rotate(0deg)';
  }
  
  // Start animation
  initFlyingCapAnimation();
}

// Pure JavaScript animation function
function animateCapToNav() {
  console.log('Starting flying cap animation...');
  
  const logoFly = document.getElementById('logo-fly');
  const navTitle = document.querySelector('#nav-title');
  const navLogo = document.getElementById('nav-logo');
  
  // Get target position from existing "Mentora" text in navbar
  const targetRect = navTitle.getBoundingClientRect();
  
  // Calculate the size of the letter "M" in the navbar to match it perfectly
  const navFontSize = parseInt(window.getComputedStyle(navTitle).fontSize);
  const targetSize = navFontSize * 0.8; // Slightly smaller than font size to match letter "M"
  const scaleRatio = targetSize / 128; // 128px is the original cap size
  
  // Calculate final position (immediately to the left of "Mentora" text)
  const finalX = targetRect.left - targetSize - 8; // 8px gap from text
  const finalY = targetRect.top + (targetRect.height / 2) - (targetSize / 2); // Center vertically
  
  console.log('Animation targets:', {
    finalPos: { x: finalX, y: finalY },
    targetSize: targetSize,
    scaleRatio: scaleRatio,
    targetRect: { left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height }
  });
  
  // Add logo-flying class to body for content animation
  document.body.classList.add('logo-flying');
  
  // Animate the cap with 1.2s transition - FLYING not teleporting
  logoFly.style.transform = `translate(${finalX}px, ${finalY}px) scale(${scaleRatio}) rotate(360deg)`;
  
  // After animation completes, lock into nav
  setTimeout(() => {
    console.log('Animation complete! Locking cap into nav...');
    
    // Remove absolute positioning
    logoFly.style.position = 'static';
    logoFly.style.left = '';
    logoFly.style.top = '';
    logoFly.style.transform = '';
    logoFly.style.zIndex = '';
    
    // Resize to match the letter "M" size
    logoFly.className = `text-cyan-400`;
    logoFly.style.width = targetSize + 'px';
    logoFly.style.height = targetSize + 'px';
    
    // Insert as first child of nav-logo (before "Mentora" text)
    navLogo.insertBefore(logoFly, navTitle);
    
    // Remove logo-flying class
    document.body.classList.remove('logo-flying');
    
    console.log('Cap successfully integrated into navigation');
  }, 1200); // Match the 1.2s transition duration
}

// NEW: Apply all the new dynamic effects
function applyNewDynamicEffects() {
  console.log('Applying new dynamic effects...');
  
  // Apply typing animation to hero title
  const heroTitle = document.querySelector('#hero-title');
  if (heroTitle) {
    heroTitle.classList.add('typing-animation');
  }
  
  // Apply magnetic effect to primary buttons
  document.querySelectorAll('.btn-primary, .gradient-button').forEach(btn => {
    btn.classList.add('magnetic-button', 'ripple-effect');
  });
  
  // Apply particle trail to special elements
  document.querySelectorAll('.nav-btn, .teacher-card').forEach(el => {
    el.classList.add('particle-trail');
  });
  
  // Apply floating animation to value cards
  document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-3.gap-6.mb-10 > div').forEach((card, index) => {
    card.classList.add('float-animation');
    card.style.animationDelay = `${index * 0.2}s`;
  });
  
  // Apply sparkle effect to emojis
  document.querySelectorAll('.text-6xl').forEach(emoji => {
    emoji.classList.add('sparkle');
  });
  
  // Apply gradient text to special headings
  document.querySelectorAll('h1, h2').forEach(heading => {
    if (heading.textContent.includes('Mentora') || heading.textContent.includes('Free')) {
      heading.classList.add('gradient-text');
    }
  });
  
  // Apply neon glow to important text
  document.querySelectorAll('.text-cyan-300, .text-cyan-400').forEach(text => {
    text.classList.add('neon-glow');
  });
  
  // Apply wave animation to emojis in testimonials
  document.querySelectorAll('.testimonial .text-4xl').forEach(emoji => {
    emoji.classList.add('wave-animation');
  });
  
  // Apply morphing background to special sections
  document.querySelectorAll('.bg-gradient-to-r').forEach(bg => {
    bg.classList.add('morphing-bg');
  });
  
  // Apply text reveal animation to bios
  document.querySelectorAll('.teacher-card .text-sm').forEach(bio => {
    bio.classList.add('text-reveal');
  });
  
  // Apply glitch effect to special elements on hover
  document.querySelectorAll('.teacher-card').forEach(card => {
    card.classList.add('glitch-effect');
  });
  
  // Apply bounce on scroll to testimonials
  document.querySelectorAll('.testimonial-slide').forEach(slide => {
    slide.classList.add('bounce-on-scroll');
  });
  
  console.log('New dynamic effects applied successfully!');
}

// Call initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  renderTeachers();
  initVisualEnhancements();
  
  // Ensure flying cap animation is called
  setTimeout(() => {
    console.log('Calling flying cap animation...');
    initFlyingCapAnimation();
  }, 100);
});

// Re-initialize enhancements when sections change
function reinitializeEnhancements() {
  setTimeout(() => {
    enhanceButtons();
  }, 100);
}

// Update the showSection function to reinitialize enhancements
const originalShowSection = showSection;
showSection = function(section) {
  originalShowSection(section);
  reinitializeEnhancements();
};

// === Mentora SPA Animations & Interactivity ===

// 1. Scroll-triggered fade-in/slide-up for main sections
function animateSectionsOnScroll() {
  const sections = document.querySelectorAll('section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  sections.forEach(section => {
    section.classList.add('opacity-0');
    observer.observe(section);
  });
}

// 2. Enhance all primary buttons with glowing gradient
function enhanceGradientButtons() {
  document.querySelectorAll('.gradient-button').forEach(btn => {
    btn.classList.add('bg-gradient-to-r', 'from-purple-500', 'via-pink-500', 'to-indigo-500', 'hover:scale-105', 'transition-all', 'duration-300', 'hover:shadow-xl');
  });
}

// 3. Teacher card hover: lift, glow, shimmer
function enhanceTeacherCards() {
  const grid = document.getElementById('teachers-grid');
  if (!grid) return;
  grid.querySelectorAll('div').forEach(card => {
    // Add enhanced hover effects that work with the entrance animations
    card.classList.add('hover:scale-105', 'hover:shadow-xl', 'hover:ring-2', 'hover:ring-cyan-400/50', 'hover:z-10', 'hover:bg-gray-800/80');
  });
}

// 4. Calendar cell animation: glow, pulse, fade/slide month
function enhanceCalendar() {
  const calendar = document.getElementById('calendar');
  if (!calendar) return;
  // Cell hover glow
  calendar.addEventListener('mouseover', e => {
    if (e.target.classList.contains('calendar-day') && !e.target.disabled) {
      e.target.classList.add('ring-2', 'ring-purple-400', 'shadow-lg');
    }
  });
  calendar.addEventListener('mouseout', e => {
    if (e.target.classList.contains('calendar-day')) {
      e.target.classList.remove('ring-2', 'ring-purple-400', 'shadow-lg');
    }
  });
  // Cell click pulse
  calendar.addEventListener('click', e => {
    if (e.target.classList.contains('calendar-day') && !e.target.disabled) {
      e.target.classList.add('animate-pulse-glow');
      setTimeout(() => e.target.classList.remove('animate-pulse-glow'), 600);
    }
  });
  // Month transition fade/slide
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  if (calPrev && calNext) {
    [calPrev, calNext].forEach(btn => {
      btn.addEventListener('click', () => {
        calendar.classList.remove('animate-fade-in-up');
        void calendar.offsetWidth; // force reflow
        calendar.classList.add('animate-fade-in-up');
        setTimeout(() => calendar.classList.remove('animate-fade-in-up'), 800);
      });
    });
  }
}

// 5. FAQ accordion: smooth open/close, arrow rotate, bounce
function enhanceFAQAccordion() {
  const items = document.querySelectorAll('#faq-accordion .faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const arrow = item.querySelector('.faq-arrow');
    question.addEventListener('click', () => {
      const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
      items.forEach(other => {
        const otherAnswer = other.querySelector('.faq-answer');
        const otherArrow = other.querySelector('.faq-arrow');
        otherAnswer.style.maxHeight = '0px';
        otherArrow.style.transform = 'rotate(0deg)';
        other.classList.remove('ring-2', 'ring-purple-400');
      });
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        arrow.style.transform = 'rotate(180deg)';
        item.classList.add('ring-2', 'ring-purple-400');
        question.classList.add('animate-bounce-in');
        setTimeout(() => question.classList.remove('animate-bounce-in'), 600);
      }
    });
  });
}

// 6. Enhance all cards (gallery, CEO, etc.)
function enhanceAllCards() {
  document.querySelectorAll('.bg-gray-800, .rounded-xl, .rounded-2xl').forEach(card => {
    card.classList.add('transition-all', 'duration-300', 'hover:scale-105', 'hover:shadow-xl', 'hover:brightness-110');
  });
}



// 8. Responsive: ensure all enhancements work on mobile
function ensureMobileFriendly() {
  // All classes used are Tailwind mobile-friendly; nothing to do here
}

// === Initialize all enhancements on DOMContentLoaded and after section changes ===
function runMentoraAnimations() {
  animateSectionsOnScroll();
  enhanceGradientButtons();
  enhanceTeacherCards();
  enhanceCalendar();
  enhanceFAQAccordion();
  enhanceAllCards();
  enhanceValueCards();
  
  // Initialize new features
  // initCounters(); // (Commented out: Counters removed from UI)
  initTestimonials();
  initJoinBanner();
  enhanceLanguageToggle();
  
  // Initialize EmailJS form with proper error handling
  setTimeout(() => {
    if (typeof emailjs !== 'undefined') {
      console.log('[EmailJS] EmailJS is available, initializing teacher form...');
      initTeacherApplicationForm();
    } else {
      console.error('[EmailJS] EmailJS not loaded! Will retry...');
      // Retry after 2 seconds if EmailJS isn't loaded yet
      setTimeout(() => {
        if (typeof emailjs !== 'undefined') {
          console.log('[EmailJS] EmailJS loaded on retry, initializing teacher form...');
          initTeacherApplicationForm();
        } else {
          console.error('[EmailJS] EmailJS still not available after retry!');
        }
      }, 2000);
    }
  }, 100);
  
  ensureMobileFriendly();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Starting Mentora animations...');
  runMentoraAnimations();
});

// Re-run enhancements after navigation/section change
const origShowSection = showSection;
showSection = function(section) {
  origShowSection(section);
  setTimeout(runMentoraAnimations, 100);
};

// --- Enhanced Value Cards with Emoji Icons ---
function enhanceValueCards() {
  const valueCards = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-3.gap-6.mb-10 > div');
  valueCards.forEach(card => {
    // Add enhanced hover effects
    card.classList.add('group', 'hover:scale-105', 'transition-all', 'duration-300', 'hover:shadow-xl', 'hover:brightness-110');
    
    // Add emoji animation on hover
    const emoji = card.querySelector('.text-6xl');
    if (emoji) {
      emoji.classList.add('group-hover:scale-110', 'transition-transform', 'duration-300');
    }
  });
}

// --- Update value cards language ---
function updateValueCardsLang() {
  document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-3.gap-6.mb-10 [data-en]').forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
}

// --- Testimonials Carousel ---
function initTestimonials() {
  const testimonials = [
    {
      en: "Thanks to Mentora, I passed my math finals! The volunteers were super kind and helpful!",
      ru: "Благодаря Mentora я сдал финальный экзамен по математике! Волонтеры были очень добрыми и полезными!",
      author: { en: "— Aigerim, Grade 11", ru: "— Айгерим, 11 класс" }
    },
    {
      en: "The volunteers were super kind and helpful! I learned so much in just a few sessions.",
      ru: "Волонтеры были очень добрыми и полезными! Я так много узнал всего за несколько занятий.",
      author: { en: "— Daniyar, Grade 10", ru: "— Данияр, 10 класс" }
    },
    {
      en: "Mentora helped me understand English grammar better than my school teacher!",
      ru: "Mentora помогла мне понять английскую грамматику лучше, чем мой школьный учитель!",
      author: { en: "— Aisuluu, Grade 9", ru: "— Айсулуу, 9 класс" }
    }
  ];
  
  let currentIndex = 0;
  const container = document.getElementById('testimonials');
  const slide = document.querySelector('.testimonial-slide');
  
  if (!container || !slide) return;
  
  // Initialize with first testimonial
  updateTestimonial();
  
  function updateTestimonial() {
    const testimonial = testimonials[currentIndex];
    const testimonialDiv = slide.querySelector('.testimonial');
    
    // Add fade out effect
    testimonialDiv.style.opacity = '0';
    testimonialDiv.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      testimonialDiv.innerHTML = `
        <div class="text-4xl mb-4">⭐</div>
        <p class="text-lg mb-4" data-en="${testimonial.en}" data-ru="${testimonial.ru}">${testimonial[currentLang]}</p>
        <div class="text-sm text-cyan-300" data-en="${testimonial.author.en}" data-ru="${testimonial.author.ru}">${testimonial.author[currentLang]}</div>
      `;
      
      // Add fade in effect
      testimonialDiv.style.opacity = '1';
      testimonialDiv.style.transform = 'translateY(0)';
    }, 350);
  }
  
  function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    console.log(`Switching to testimonial ${currentIndex + 1} of ${testimonials.length}`);
    updateTestimonial();
  }
  
  function prevTestimonial() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateTestimonial();
  }
  
  // Auto-rotate testimonials every 5.5 seconds with smooth transitions
  let autoPlayInterval = setInterval(nextTestimonial, 5500);
  console.log('Testimonial auto-play started with 5.5 second interval');
  
  // Pause auto-play on hover
  container.addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
    console.log('Testimonial auto-play paused on hover');
  });
  
  // Resume auto-play when mouse leaves
  container.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(nextTestimonial, 5500);
    console.log('Testimonial auto-play resumed');
  });
  
  // Update language when changed
  const originalUpdateLang = updateLang;
  updateLang = function() {
    originalUpdateLang();
    updateTestimonial();
  };
}

// --- Sticky Join Banner ---
function initJoinBanner() {
  const banner = document.getElementById('join-banner');
  const joinBtn = document.getElementById('join-volunteer-btn');
  
  if (!banner || !joinBtn) return;
  
  let lastScrollY = window.scrollY;
  let isVisible = false;
  
  function handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollThreshold = 300; // Show after scrolling 300px
    
    if (currentScrollY > scrollThreshold && currentScrollY < lastScrollY && !isVisible) {
      // Scrolling up and past threshold
      banner.classList.remove('hidden');
      banner.classList.add('banner-slide-down');
      isVisible = true;
    } else if ((currentScrollY <= scrollThreshold || currentScrollY > lastScrollY) && isVisible) {
      // Scrolling down or back to top
      banner.classList.add('banner-slide-up');
      setTimeout(() => {
        banner.classList.add('hidden');
        banner.classList.remove('banner-slide-up', 'banner-slide-down');
      }, 500);
      isVisible = false;
    }
    
    lastScrollY = currentScrollY;
  }
  
  window.addEventListener('scroll', handleScroll);
  
  // Click handler to open Become a Teacher section
  joinBtn.addEventListener('click', () => {
    showSection('become');
    // Hide banner after clicking
    banner.classList.add('banner-slide-up');
    setTimeout(() => {
      banner.classList.add('hidden');
      banner.classList.remove('banner-slide-up', 'banner-slide-down');
    }, 500);
    isVisible = false;
  });
}

// --- Enhanced Language Toggle ---
function enhanceLanguageToggle() {
  const langToggle = document.getElementById('lang-toggle');
  const mainContent = document.getElementById('main-content');
  
  if (!langToggle || !mainContent) return;
  
  langToggle.addEventListener('click', () => {
    // Add fade transition
    mainContent.classList.add('fade-transition');
    mainContent.style.opacity = '0.7';
    
    setTimeout(() => {
      updateLang();
      mainContent.style.opacity = '1';
      mainContent.classList.remove('fade-transition');
    }, 150);
  });
}

// --- EmailJS Teacher Application Form ---
function initTeacherApplicationForm() {
  const form = document.getElementById('teacher-form');
  
  if (!form) {
    console.error('Teacher form not found!');
    return;
  }
  
  // Check if form is already initialized to prevent duplicate event listeners
  if (form.dataset.initialized === 'true') {
    console.log('Form already initialized, skipping...');
    return;
  }
  
  console.log('Initializing teacher application form...');
  console.log('EmailJS available:', typeof emailjs !== 'undefined');
  console.log('Form element found:', form);
  
  // Mark form as initialized
  form.dataset.initialized = 'true';
  
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log('Form submitted!');
    
    // Get status elements
    const formStatus = document.getElementById('form-status');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const loadingMessage = document.getElementById('loading-message');
    const submitBtn = document.getElementById('submit-application');
    
    // Check 1-hour cooldown
    const lastFormSent = localStorage.getItem('mentora_last_form_sent');
    const now = Date.now();
    const oneHour = 3600000; // 1 hour in milliseconds
    
    if (lastFormSent && (now - parseInt(lastFormSent)) < oneHour) {
      const remainingTime = Math.ceil((oneHour - (now - parseInt(lastFormSent))) / 60000); // minutes
      console.log(`Form submission blocked: ${remainingTime} minutes remaining in cooldown`);
      
      // Show cooldown message
      formStatus.classList.remove('hidden');
      successMessage.classList.add('hidden');
      loadingMessage.classList.add('hidden');
      errorMessage.classList.remove('hidden');
      errorMessage.querySelector('span').textContent = `Please wait ${remainingTime} minutes before submitting another application.`;
      
      return;
    }
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Hide previous messages and show loading
    formStatus.classList.remove('hidden');
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingMessage.classList.remove('hidden');
    
    // Log form data for debugging
    const formData = new FormData(this);
    const formDataObj = Object.fromEntries(formData);
    console.log('Form data:', formDataObj);
    
    // Verify all required fields are present
    const requiredFields = ['fullName', 'institution', 'lessonEmail', 'telegram', 'subjects', 'availability', 'motivation'];
    const missingFields = requiredFields.filter(field => !formDataObj[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      loadingMessage.classList.add('hidden');
      errorMessage.classList.remove('hidden');
      errorMessage.querySelector('span').textContent = 'Please fill in all required fields: ' + missingFields.join(', ');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }
    
    console.log('Sending email via EmailJS...');
    console.log('Service ID:', window.APP_CONFIG.EMAILJS_SERVICE_ID);
    console.log('Template ID:', window.APP_CONFIG.EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', window.APP_CONFIG.EMAILJS_PUBLIC_KEY);
    console.log('EmailJS available:', typeof emailjs !== 'undefined');
    console.log('EmailJS version:', emailjs?.version);
    
    // Verify EmailJS is properly initialized
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS is not loaded');
    }
    
    // Use emailjs.sendForm with the correct parameters
    emailjs.sendForm(
      window.APP_CONFIG.EMAILJS_SERVICE_ID,    // Service ID
      window.APP_CONFIG.EMAILJS_TEMPLATE_ID,   // Template ID
      this,                                     // Form element
      window.APP_CONFIG.EMAILJS_PUBLIC_KEY     // Public Key
    ).then((response) => {
      console.log('EmailJS Success:', response);
      console.log('Email sent to mentora.auth@gmail.com');
      
      // Store timestamp for cooldown
      localStorage.setItem('mentora_last_form_sent', now.toString());
      
      loadingMessage.classList.add('hidden');
      successMessage.classList.remove('hidden');
      this.reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        formStatus.classList.add('hidden');
      }, 5000);
    }, (error) => {
      console.error('EmailJS Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        text: error.text
      });
      loadingMessage.classList.add('hidden');
      errorMessage.classList.remove('hidden');
      
      // Provide more specific error messages
      let errorText = 'Failed to send. Please try again later.';
      if (error.status === 0) {
        errorText = 'Network error. Please check your internet connection.';
      } else if (error.status === 400) {
        errorText = 'Invalid form data. Please check all fields.';
      } else if (error.status === 403) {
        errorText = 'Email service error. Please try again later.';
      } else if (error.status === 429) {
        errorText = 'Too many requests. Please wait a moment and try again.';
      }
      
      errorMessage.querySelector('span').textContent = errorText;
    }).finally(() => {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  });
  
  console.log('Teacher application form initialized successfully');
  
  // Add additional protection to submit button (but don't interfere with form submission)
  const submitBtn = document.getElementById('submit-application');
  if (submitBtn) {
    // Only prevent default if it's not a form submission
    submitBtn.addEventListener('click', function(e) {
      // Don't prevent default here - let the form submit handler handle it
      console.log('Submit button clicked - allowing form submission');
    });
  }
  
  // Log EmailJS version for verification
  if (typeof emailjs !== 'undefined') {
    console.log('EmailJS version:', emailjs.version);
  }
  
  // Check and display current cooldown status
  checkCooldownStatus();
}

// --- Check and display cooldown status ---
function checkCooldownStatus() {
  const lastFormSent = localStorage.getItem('mentora_last_form_sent');
  const now = Date.now();
  const oneHour = 3600000; // 1 hour in milliseconds
  
  if (lastFormSent && (now - parseInt(lastFormSent)) < oneHour) {
    const remainingTime = Math.ceil((oneHour - (now - parseInt(lastFormSent))) / 60000); // minutes
    console.log(`Cooldown active: ${remainingTime} minutes remaining`);
    
    // Show cooldown status in form
    const formStatus = document.getElementById('form-status');
    const errorMessage = document.getElementById('error-message');
    
    if (formStatus && errorMessage) {
      formStatus.classList.remove('hidden');
      errorMessage.classList.remove('hidden');
      errorMessage.querySelector('span').textContent = `Please wait ${remainingTime} minutes before submitting another application.`;
    }
  }
}





// --- Update form language on toggle ---
function updateFormLang() {
  // Update form labels and placeholders
  document.querySelectorAll('#teacher-form [data-en]').forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = el.dataset[currentLang];
    } else {
      el.textContent = el.dataset[currentLang];
    }
  });
  
  // Update button text
  const submitBtn = document.getElementById('submit-application');
  if (submitBtn) {
    submitBtn.textContent = submitBtn.dataset[currentLang];
  }
}

// === AI Support (gpt-4.1-mini) ===
// Global flag to prevent multiple initializations
let realAIModalInitialized = false;

// AI Support conversation state management
let realAIConversationState = {
  step: 0, // 0 = initial, 1 = subject, 2 = time, 3 = language, 4 = additionalInfo
  subject: null,
  timeSlots: null,
  language: null,
  additionalInfo: null,
  isTutorSearch: false
};

// Reset AI Support conversation state
function resetRealAIConversationState() {
  realAIConversationState = {
    step: 0,
    subject: null,
    timeSlots: null,
    language: null,
    additionalInfo: null,
    isTutorSearch: false
  };
  console.log('[AI Support] Conversation state reset');
}

// Update input placeholder based on conversation step
function updateInputPlaceholder(step) {
  const input = document.getElementById('real-ai-input');
  if (!input) return;
  
  switch (step) {
    case 0:
      input.placeholder = 'e.g., math, english, science...';
      break;
    case 1:
      input.placeholder = 'e.g., Monday 17:00-19:00, after 15:00...';
      break;
    case 2:
      input.placeholder = 'e.g., English, Russian, Spanish...';
      break;
    case 3:
      input.placeholder = 'e.g., visual style, chess, or "no preferences"...';
      break;
    default:
      input.placeholder = 'Type your message...';
  }
}

// Old AI Tutor Modal function removed - replaced with new gpt-4.1-mini powered AI Support system

// Real AI Tutor Modal Initialization
function initRealAITutorModal() {
  console.log('[Real AI Tutor] Creating bulletproof modal...');
  
  // Check if already initialized
  if (realAIModalInitialized || document.getElementById('real-ai-modal')) {
    console.log('[Real AI Tutor] Modal already exists');
    return;
  }
  
  realAIModalInitialized = true;
  
  // Create modal HTML with improved positioning
  const modalHTML = `
    <div id="real-ai-modal" class="fixed inset-0 z-50 hidden bg-black/50 backdrop-blur-sm p-4">
      <div id="real-ai-modal-container" class="bg-gray-900 p-8 rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col absolute" style="top: 15%; left: 50%; transform: translateX(-50%);">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-purple-300 flex items-center gap-3">
            <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            AI Support
          </h3>
          <button id="real-ai-close" type="button" class="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-all duration-200">&times;</button>
        </div>
        <div id="real-ai-messages" class="bg-gray-800 p-4 rounded-xl mb-4 flex-1 overflow-y-auto min-h-[200px] max-h-[300px] text-sm">
          <div class="text-purple-300 mb-2">AI: Hello! I'm your AI Support assistant. I'll help you find the perfect tutor through a structured conversation. 
          <br><br>📋 <strong>Steps:</strong>
          <br>1. Subject (math, english, science)
          <br>2. Time availability 
          <br>3. Teaching language
          <br>4. Additional preferences (optional)
          <br><br>What subject do you need help with?</div>
        </div>
        <form id="real-ai-form" class="flex gap-3">
          <input id="real-ai-input" type="text" autocomplete="off" placeholder="e.g., math, english, science..." class="flex-1 px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none border border-gray-600">
          <button id="real-ai-send" type="submit" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-semibold transition-all duration-200 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            Send
          </button>
        </form>
      </div>
    </div>
  `;
  
  // Add to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  console.log('[Real AI Tutor] ✅ Modal HTML created with improved positioning!');
  
  // Set up event handlers immediately
  const input = document.getElementById('real-ai-input');
  const sendBtn = document.getElementById('real-ai-send');
  const closeBtn = document.getElementById('real-ai-close');
  const messages = document.getElementById('real-ai-messages');
  const modal = document.getElementById('real-ai-modal');
  const form = document.getElementById('real-ai-form');
  
  // Defensive checks
  if (!input || !sendBtn || !closeBtn || !messages || !modal || !form) {
    console.error('[Real AI Tutor] Missing elements! Cannot set up event handlers.');
    console.error('[Real AI Tutor] Found:', {input: !!input, sendBtn: !!sendBtn, closeBtn: !!closeBtn, messages: !!messages, modal: !!modal, form: !!form});
    return;
  }
  
  console.log('[Real AI Tutor] Setting up bulletproof event handlers...');
  
  // Send function with structured conversation handling
  const doSend = async () => {
    try {
      const text = input.value.trim();
      if (!text) {
        console.log('[Real AI Tutor] Empty input, skipping send');
        return;
      }
      
      console.log('[Real AI Tutor] 🚀 STRUCTURED SEND initiated:', text);
      console.log('[Real AI Tutor] Current conversation state:', realAIConversationState);
      console.log('[Real AI Tutor] 🚀 NO PAGE RELOAD - Form submission handled correctly');
      
      // Add user message
      const userDiv = document.createElement('div');
      userDiv.textContent = 'You: ' + text;
      userDiv.className = 'mb-2 text-blue-300';
      messages.appendChild(userDiv);
      
      input.value = '';
      
      // Add loading message with spinner
      const loadDiv = document.createElement('div');
      loadDiv.className = 'mb-2 text-purple-300 flex items-center space-x-2';
      loadDiv.id = 'real-ai-loading-msg';
      
      // Create spinner
      const spinner = document.createElement('div');
      spinner.className = 'animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400';
      spinner.innerHTML = '🤖';
      
      // Create loading text
      const loadingText = document.createElement('span');
      loadingText.textContent = 'AI: Thinking...';
      
      loadDiv.appendChild(spinner);
      loadDiv.appendChild(loadingText);
      messages.appendChild(loadDiv);
      
      messages.scrollTop = messages.scrollHeight;
      
      // Prepare request payload
      const requestPayload = {
        prompt: text,
        conversationState: realAIConversationState
      };
      
      // AI functionality disabled for static deployment
      // const apiUrl = window.APP_CONFIG.API_BASE_URL || window.location.origin;
      // const response = await fetch(`${apiUrl}/api/ai-tutor`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestPayload)
      // });
      
      // Mock response for static deployment
      const response = {
        ok: true,
        json: async () => ({
          type: 'needs_info',
          response: 'AI functionality is currently disabled in static deployment.',
          conversationState: { step: 0, subject: null, timeSlots: null, language: null, isTutorSearch: false }
        })
      };
      
      console.log('[Real AI Tutor] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[Real AI Tutor] Response data:', data);
      
      document.getElementById('real-ai-loading-msg')?.remove();
      
      const aiDiv = document.createElement('div');
      if (data.error) {
        aiDiv.textContent = 'AI: Error - ' + data.error;
        aiDiv.className = 'mb-2 text-red-300';
      } else {
        aiDiv.textContent = 'AI: ' + (data.response || data.reply || 'No response');
        aiDiv.className = 'mb-2 text-purple-300';
        
        // Update conversation state if provided
        if (data.conversationState) {
          realAIConversationState = data.conversationState;
          console.log('[Real AI Tutor] Updated conversation state:', realAIConversationState);
          
          // Update placeholder based on current step
          updateInputPlaceholder(realAIConversationState.step);
        }
        
        // If this is a tutor match response, display the tutors
        if (data.type === 'tutor_matches' && data.tutorIds && data.tutorIds.length > 0) {
          // Close the Real AI modal
          modal.classList.add('hidden');
          document.body.classList.remove('modal-open');
          
          // Navigate to teachers section
          showSection('teachers', false);
          
          // Filter and display the matched tutors
          filterAndDisplayMatchedTutors(data.tutorIds);
          
          // Reset conversation state after successful match
          resetRealAIConversationState();
        } else if (data.type === 'tutor_matches' && (!data.tutorIds || data.tutorIds.length === 0)) {
          // No tutors found - show manual filters as fallback
          console.log('[Real AI Tutor] No tutors found, showing manual filters fallback');
          
          // Close the Real AI modal
          modal.classList.add('hidden');
          document.body.classList.remove('modal-open');
          
          // Show manual filters with a helpful message
          const fallbackMessage = currentLang === 'en' 
            ? 'No tutors found matching your criteria. Try using the manual filters below to find suitable tutors.'
            : 'Преподаватели, соответствующие вашим критериям, не найдены. Попробуйте использовать ручные фильтры ниже для поиска подходящих преподавателей.';
          
          showManualFiltersFallback(fallbackMessage);
          
          // Reset conversation state
          resetRealAIConversationState();
        }
      }
      
      messages.appendChild(aiDiv);
      messages.scrollTop = messages.scrollHeight;
      
      console.log('[Real AI Tutor] ✅ Message sent successfully - NO PAGE RELOAD');
      
    } catch (error) {
      console.error('[Real AI Tutor] Error in doSend:', error);
      console.error('[Real AI Tutor] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      document.getElementById('real-ai-loading-msg')?.remove();
      
      const errorDiv = document.createElement('div');
      let errorMessage = 'Error: Connection failed';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Error: Cannot connect to AI server. Please check if server is running on port 3001.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Error: Invalid response from server.';
      }
      
      errorDiv.textContent = errorMessage;
      errorDiv.className = 'mb-2 text-red-300';
      messages.appendChild(errorDiv);
      
      // Add fallback suggestion
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'mb-2 text-blue-300';
      fallbackDiv.innerHTML = `
        <div class="flex items-center gap-2 mt-3 p-3 bg-blue-500/20 rounded-lg">
          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Try using the 
            <button onclick="modal.classList.add('hidden'); document.body.classList.remove('modal-open'); showManualFiltersFallback('${currentLang === 'en' ? 'AI is temporarily unavailable. Use the manual filters to find tutors.' : 'ИИ временно недоступен. Используйте ручные фильтры для поиска преподавателей.'}')" 
                    class="text-blue-400 hover:text-blue-300 underline">manual filters</button> 
            instead.
          </span>
        </div>
      `;
      messages.appendChild(fallbackDiv);
      
      messages.scrollTop = messages.scrollHeight;
    }
  };
  
  // ULTRA-SAFE Form submit handler using addEventListener
  form.addEventListener('submit', function(e) {
    console.log('[Real AI Tutor] 🔥 ULTRA-SAFE Form submitted via addEventListener');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    doSend();
    return false;
  });
  
  // Additional Send button handler as backup
  sendBtn.addEventListener('click', function(e) {
    console.log('[Real AI Tutor] 🔥 ULTRA-SAFE Send button clicked via addEventListener');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    doSend();
    return false;
  });
  
  // Input enter key handler
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      console.log('[Real AI Tutor] 🔥 Enter key pressed');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      doSend();
      return false;
    }
  });
  
  // Close button handler
  closeBtn.addEventListener('click', function(e) {
    console.log('[Real AI Tutor] 🔥 Close button clicked');
    e.preventDefault();
    e.stopPropagation();
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    resetRealAIConversationState();
  });
  
  // Escape key handler
  const escapeHandler = function(e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      console.log('[Real AI Tutor] 🔥 Escape key pressed');
      e.preventDefault();
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
      resetRealAIConversationState();
    }
  };
  
  document.addEventListener('keydown', escapeHandler);
  
  console.log('[Real AI Tutor] ✅ ULTRA-BULLETPROOF event handlers set up successfully with addEventListener!');
  console.log('[Real AI Tutor] ✅ Form element found and submit handler attached:', !!form);
  console.log('[Real AI Tutor] ✅ All elements ready for form submission without page reload');
}

// Old AI modal close function removed - replaced with AI Support system

// Global close function for AI Support modal
window.closeRealAITutorModal = function() {
  console.log('[AI Support] 🔥 closeRealAITutorModal called');
  const modal = document.getElementById('real-ai-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    // Reset conversation state when closing
    resetRealAIConversationState();
    console.log('[AI Support] ✅ Modal closed successfully!');
  }
};



// Function to open AI Support modal
window.openRealAITutorModal = function() {
  console.log('[AI Support] 🔥 openRealAITutorModal called');
  
  // Ensure modal is initialized
  if (!document.getElementById('real-ai-modal')) {
    console.log('[AI Support] Modal not found, initializing...');
    initRealAITutorModal();
  }
  
  const modal = document.getElementById('real-ai-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Focus on input for better UX
    setTimeout(() => {
      const input = document.getElementById('real-ai-input');
      if (input) {
        input.focus();
      }
    }, 100);
    
    console.log('[AI Support] ✅ Modal opened successfully!');
  } else {
    console.error('[AI Support] Modal still not found after initialization!');
  }
};


// Example usage:
// document.getElementById('ai-tutor-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const prompt = document.getElementById('ai-tutor-input').value;
//   const aiReply = await sendToAITutor(prompt);
//   // Display aiReply in your UI
// });

// === AI Tutor Query Box Logic ===
// This connects the visible input/button to the backend and displays the reply.
document.addEventListener('DOMContentLoaded', () => {
  console.log('[DOM] Content loaded, initializing components...');
  
  // Global protection against unwanted page navigation with stack trace
  window.addEventListener('beforeunload', (e) => {
    console.error('[DEBUG] 🚨 CRITICAL: Page is about to unload/reload! This should NOT happen during AI chat!');
    console.error('[DEBUG] Stack trace:', new Error().stack);
    // Don't prevent it, but log it for debugging
  });
  

  
  // No more global form blocking - AI modal is now form-free
  
  // NO GLOBAL FORM BLOCKING - Let forms handle their own behavior
  // Only the AI modal components should be prevented from default form behavior
  // Teacher form and other legitimate forms should work normally
  
  // Render teachers on page load
  renderTeachers();
  
  // Initialize advanced filters
  initAdvancedFilters();
  

  
  // Initialize AI Support Modal
  console.log('[DOM] Initializing AI Support Modal...');
  initRealAITutorModal();
  
  // Initialize Teacher Application Form with EmailJS retry
  console.log('[DOM] Initializing Teacher Application Form...');
  
  // Ensure EmailJS is loaded before initializing form
  if (typeof emailjs !== 'undefined') {
    console.log('[DOM] EmailJS available, initializing form immediately');
    initTeacherApplicationForm();
  } else {
    console.log('[DOM] EmailJS not available, retrying in 1 second...');
    setTimeout(() => {
      if (typeof emailjs !== 'undefined') {
        console.log('[DOM] EmailJS loaded on retry, initializing form');
        initTeacherApplicationForm();
      } else {
        console.error('[DOM] EmailJS still not available after retry');
        // Initialize form anyway, it will handle EmailJS errors gracefully
        initTeacherApplicationForm();
      }
    }, 1000);
  }
  

  
  console.log('[DOM] All components initialized!');
});

// Add styles for chat messages
const style = document.createElement('style');
style.textContent = `
  .chat-message.user { background: rgba(21, 94, 117, 0.7); color: #aaf2ff; align-self: flex-end; text-align: right; }
  .chat-message.bot { background: rgba(31, 41, 55, 0.8); color: #fff; align-self: flex-start; text-align: left; border: 1px solid #22d3ee22; }
`;
document.head.appendChild(style);

// --- Legacy modal functions removed - using dynamic modal above ---



// --- Enhanced AI Chat Storage ---

// Fallback function to highlight manual filters when AI fails
function showManualFiltersFallback(message) {
  console.log('Showing manual filters as fallback:', message);
  
  // Navigate to teachers section if not already there
  showSection('teachers', false);
  
  // Scroll to and highlight the advanced filters
  const filtersContainer = document.getElementById('advanced-filters');
  if (filtersContainer) {
    // Add attention-grabbing animation
    filtersContainer.classList.add('ring-4', 'ring-yellow-400/50', 'bg-yellow-500/10');
    filtersContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Show a helpful message
    const existingMessage = document.getElementById('fallback-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'fallback-message';
    messageDiv.className = 'mb-4 p-4 bg-yellow-500/20 border border-yellow-400/50 rounded-xl text-center animate-bounce-in';
    messageDiv.innerHTML = `
      <div class="flex items-center justify-center gap-2 mb-2">
        <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-semibold text-yellow-300">
          ${currentLang === 'en' ? 'Try Manual Filters' : 'Попробуйте ручные фильтры'}
        </h3>
      </div>
      <p class="text-yellow-200 text-sm">
        ${message || (currentLang === 'en' 
          ? 'Use the filters below to find tutors that match your preferences'
          : 'Используйте фильтры ниже, чтобы найти преподавателей, соответствующих вашим предпочтениям'
        )}
      </p>
      <button onclick="dismissFallbackMessage()" class="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-all duration-300">
        ${currentLang === 'en' ? 'Got it' : 'Понятно'}
      </button>
    `;
    
    filtersContainer.parentNode.insertBefore(messageDiv, filtersContainer);
    
    // Remove highlighting after a few seconds
    setTimeout(() => {
      filtersContainer.classList.remove('ring-4', 'ring-yellow-400/50', 'bg-yellow-500/10');
    }, 5000);
  }
}

function dismissFallbackMessage() {
  const message = document.getElementById('fallback-message');
  if (message) {
    message.classList.add('opacity-0', 'scale-95', 'transform');
    setTimeout(() => message.remove(), 300);
  }
}

// Make fallback functions available globally
window.showManualFiltersFallback = showManualFiltersFallback;
window.dismissFallbackMessage = dismissFallbackMessage;
