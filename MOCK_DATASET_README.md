# Mock Tutor Dataset - Diverse 20-Tutor Roster

This directory contains a **carefully curated dataset of 20 diverse tutor profiles** designed to provide comprehensive subject coverage and cultural diversity for the FreePrep platform.

## 📊 Dataset Overview

### Distribution by Subject
- **Mathematics**: 7 tutors
- **English**: 6 tutors  
- **Physics**: 3 tutors
- **Chemistry**: 2 tutors
- **Biology**: 2 tutors
- **Total**: 20 tutors

### 🌍 Cultural Diversity Features
- **Geographic Representation**: Tutors from 15+ countries/cities including Mumbai, Mexico City, Dubai, Seoul, São Paulo, London, New Delhi, Cairo, Paris, Dublin, Tokyo, Moscow, MIT (Boston), Bangalore, Oxford, Beijing, and Galápagos Islands
- **Language Diversity**: 12+ languages supported including English, Mandarin, Hindi, Gujarati, Spanish, Arabic, French, Korean, Portuguese, Irish Gaelic, Japanese, Russian, Punjabi, Tamil
- **Teaching Styles**: 15+ distinct approaches including visual, analytical, structured, interactive, competitive, practical, playful, creative, communicative, academic, professional, dramatic, systematic, theoretical, experimental, cosmic, environmental, medical, exploratory

## 🎯 Purpose
This refined dataset enables comprehensive testing of:
- **Specific Science Subjects**: Physics, Chemistry, Biology as separate subject categories
- **Direct Subject Matching**: Users can search for "biology", "chemistry", or "physics" and get tutors in those specific subjects
- **Cultural Matching**: Language and geographic compatibility
- **Teaching Style Preferences**: Diverse pedagogical approaches
- **Availability Verification**: Accurate schedule matching
- **Hobby Compatibility**: Shared interests and activities

## 🔍 Enhanced Tutor Profile Structure

Each tutor profile contains:

```javascript
{
  name: 'String',                    // Full name with cultural authenticity
  subject: 'String',                 // Specific subject: math/english/physics/chemistry/biology
  bio: 'String',                     // Detailed bio highlighting expertise and background
  availableTime: ['Array'],          // Precise time slots and day patterns
  hobbies: ['Array'],               // Cultural and professional interests
  languagesSpoken: ['Array'],       // Multiple language capabilities
  teachingStyle: 'String',          // Specific pedagogical approach
  embedding: null                   // Will be computed by AI system
}
```

### Example Profile
```javascript
{
  name: 'Aisha Patel',
  subject: 'math',
  bio: 'International Baccalaureate math specialist from Mumbai. I help students excel in advanced mathematics through structured problem-solving approaches.',
  availableTime: ['14:00–17:00', 'Daily'],
  hobbies: ['classical music', 'debate', 'meditation'],
  languagesSpoken: ['English', 'Hindi', 'Gujarati'],
  teachingStyle: 'structured',
  embedding: null
}
```

## 📚 Subject Specializations

### Mathematics Tutors (7 profiles)
- **Calculus & Algebra**: Visual learning techniques (Emma Chen - China/English+Mandarin)
- **Statistics & Data Science**: Real-world applications (Marcus Thompson - USA/English)
- **IB Mathematics**: Structured problem-solving (Aisha Patel - India/English+Hindi+Gujarati)
- **Geometry & Trigonometry**: Interactive visualization (Carlos Mendoza - Mexico/English+Spanish)
- **Competition Mathematics**: Olympiad preparation (Fatima Al-Rashid - UAE/English+Arabic+French)
- **Applied Mathematics**: Engineering applications (David Kim - Korea/English+Korean)
- **Elementary Mathematics**: Games-based learning (Isabella Santos - Brazil/English+Portuguese)

### English Tutors (6 profiles)
- **Creative Writing & Literature**: Published author expertise (Jonathan Blake - UK/English)
- **ESL & IELTS Preparation**: Non-native speaker specialization (Maya Singh - India/English+Hindi+Punjabi)
- **Academic Writing**: University preparation (Ahmed Hassan - Egypt/English+Arabic)
- **Business English**: Professional communication (Sophie Laurent - France/English+French+German)
- **Classical Literature**: Shakespeare specialist (Ryan O'Connor - Ireland/English+Gaelic)
- **TOEFL Preparation**: Japanese student focus (Kenji Tanaka - Japan/English+Japanese)

### Physics Tutors (3 profiles)
- **Theoretical Physics**: Quantum mechanics expertise (Dr. Elena Volkov - Russia/English+Russian)
- **Experimental Physics**: Hands-on demonstrations (Marcus Johnson - USA/English)
- **Astrophysics**: Space exploration focus (Raj Gupta - India/English+Hindi+Tamil)

### Chemistry Tutors (2 profiles)
- **Organic Chemistry**: Real-world applications (Dr. Sarah Mitchell - UK/English)
- **Environmental Chemistry**: Sustainability focus (Liu Wei - China/English+Mandarin)

### Biology Tutors (2 profiles)
- **Medical Biology**: Pre-med preparation (Dr. Priya Sharma - India/English+Hindi)
- **Marine Biology**: Ocean life specialization (Alexandra Torres - Ecuador/English+Spanish)

## 🗓️ Schedule Accuracy

Each tutor's displayed weekly schedule **exactly matches** their database availability:
- **Time Range Parsing**: "16:00–19:00" accurately reflected in schedule grid
- **Day Pattern Recognition**: "Weekends", "Weekdays", "Daily", "Mon-Wed-Fri" correctly displayed
- **Mixed Format Support**: ["16:00–19:00", "Weekends"] combinations properly handled
- **Visual Confirmation**: ✅ for available slots, ⛔ for unavailable times

## 🚀 Implementation Benefits

1. **Reduced Complexity**: 20 instead of 50 profiles for faster loading and cleaner UI
2. **Enhanced Diversity**: More authentic cultural representation per tutor
3. **Specific Science Subjects**: Precise Physics/Chemistry/Biology labels instead of generic "Science"
4. **Schedule Integrity**: Perfect alignment between data and display
5. **Realistic Matching**: Better simulation of real-world tutor-student connections

This dataset provides a realistic, diverse, and technically sound foundation for testing all platform features while maintaining optimal performance and user experience. 