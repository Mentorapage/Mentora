# AI Tutor API Documentation

## Overview

The AI Tutor API (`/api/ai-tutor.js`) is a Vercel serverless function that implements an intelligent tutor matching system for the Mentora platform. It uses a strict step-by-step conversation flow to collect user preferences and then matches them with the best available tutors using either OpenAI's GPT-4.1-mini model or a manual fallback algorithm.

## Features

- **Strict Step-by-Step Flow**: Collects 4 inputs in order: subject, time, language, hobbies
- **Weighted Scoring System**: Subject (9000), Time (900), Language (90), Hobbies (10)
- **Multi-language Support**: English and Russian interface languages
- **AI-Powered Matching**: Uses GPT-4.1-mini for intelligent tutor selection
- **Manual Fallback**: Robust fallback system when AI is unavailable
- **Exact Data Consistency**: Uses the same tutor database as the website

## Conversation Flow

### Step 0: Language Selection
- User chooses interface language (English/Russian)
- Required before proceeding to subject selection

### Step 1: Subject Detection (MANDATORY - 9000 points)
- **Required**: User must specify a subject
- **Supported**: math, physics, chemistry, biology, english
- **Detection**: Handles variations like "algebra", "calculus", "quantum physics", etc.
- **Cannot proceed** until valid subject is provided

### Step 2: Time Slots (MANDATORY - 900 points)
- **Required**: User must specify available time slots
- **Format**: Accepts "17:00", "17-19", "5pm", etc.
- **Range**: 15:00-22:00 (GMT+6)
- **Cannot proceed** until valid time is provided

### Step 3: Teaching Language (MANDATORY - 90 points)
- **Required**: User must specify preferred teaching language
- **Supported**: English, Russian, Mandarin, Spanish, French, German, Japanese, Korean, Arabic, Hindi, Portuguese, Gujarati, Punjabi, Tamil, Catalan, Irish Gaelic
- **Cannot proceed** until valid language is provided

### Step 4: Hobbies/Preferences (OPTIONAL - 10 points)
- **Optional**: User can specify hobbies or learning preferences
- **Scoring**: Provides bonus points for matching tutors
- **Examples**: chess, programming, cooking, music, sports, etc.

## Scoring System

The API uses a weighted scoring system to rank tutors:

| Criteria | Points | Weight | Description |
|----------|--------|--------|-------------|
| Subject | 9000 | 90% | Exact subject match required |
| Time | 900 | 9% | At least one time slot matches |
| Language | 90 | 0.9% | At least one language matches |
| Hobbies | 10 | 0.1% | At least one hobby matches |

**Total Maximum Score**: 10,000 points

## API Endpoint

```
POST /api/ai-tutor
```

### Request Body

```json
{
  "message": "string",
  "conversationState": {
    "step": 0,
    "subject": null,
    "timeSlots": null,
    "languages": null,
    "hobbies": null,
    "interfaceLanguage": "English"
  }
}
```

### Response Format

#### Needs Information
```json
{
  "type": "needs_info",
  "response": "What subject do you need help with?",
  "conversationState": {
    "step": 1,
    "subject": null,
    "timeSlots": null,
    "languages": null,
    "hobbies": null,
    "interfaceLanguage": "English"
  }
}
```

#### Tutor Matches
```json
{
  "type": "tutor_matches",
  "response": "Found 3 excellent tutors for you!",
  "tutors": [
    {
      "name": "Emma Chen",
      "subject": "math",
      "bio": "Calculus and algebra specialist...",
      "availableTime": ["16:00–19:00", "Weekends"],
      "hobbies": ["chess", "programming", "hiking"],
      "languagesSpoken": ["English", "Mandarin"],
      "teachingStyle": "visual",
      "telegram": "@emma_math_tutor",
      "score": 9992,
      "scoreBreakdown": {
        "subject": 9000,
        "time": 900,
        "language": 90,
        "hobbies": 2
      },
      "matchingReasons": ["Subject matches", "Time available", "Language matches"]
    }
  ],
  "conversationState": {
    "step": 0,
    "subject": "math",
    "timeSlots": ["17:00"],
    "languages": ["English"],
    "hobbies": ["chess", "programming"],
    "interfaceLanguage": "English"
  }
}
```

## Environment Variables

### Required
- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4.1-mini access

### Optional
- `NODE_ENV`: Set to "development" to export helper functions for testing

## Usage Examples

### Basic English Flow
```javascript
// Step 1: Language selection
const response1 = await fetch('/api/ai-tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'English' })
});

// Step 2: Subject
const response2 = await fetch('/api/ai-tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: 'math',
    conversationState: response1.conversationState 
  })
});

// Continue with time, language, and hobbies...
```

### Russian Flow
```javascript
// Russian language selection
const response1 = await fetch('/api/ai-tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Russian' })
});

// Russian subject
const response2 = await fetch('/api/ai-tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: 'математика',
    conversationState: response1.conversationState 
  })
});
```

## Testing

### Local Testing
```bash
# Start the development server
npm run dev

# Run local tests
node test-ai-tutor-local.js

# Run comprehensive tests
node test-ai-tutor-comprehensive.js
```

### Test Scenarios
1. **Complete English Tutor Search**: Full flow with English interface
2. **Complete Math Tutor Search**: Math subject with chess/programming hobbies
3. **Complete Physics Tutor Search**: Physics with astronomy interest
4. **Russian Language Flow**: Full Russian interface flow
5. **Error Handling**: Invalid requests and edge cases

### Test Verification
- ✅ Step-by-step conversation flow
- ✅ Subject detection accuracy
- ✅ Time parsing validation
- ✅ Language detection
- ✅ Hobby matching
- ✅ Scoring system accuracy
- ✅ AI vs manual fallback
- ✅ Error handling

## Deployment

### Vercel Deployment
1. Ensure `OPENAI_API_KEY` is set in Vercel environment variables
2. Deploy to Vercel using standard deployment process
3. The API will be available at `https://your-app.vercel.app/api/ai-tutor`

### Local Development
1. Create `.env` file with `OPENAI_API_KEY`
2. Run `npm install` to install dependencies
3. Start development server with `npm run dev`

## Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**
   - Error: "OpenAI API key not found"
   - Solution: Set `OPENAI_API_KEY` environment variable
   - Fallback: API will use manual matching

2. **Port Already in Use**
   - Error: "EADDRINUSE: address already in use :::3001"
   - Solution: Kill existing process or change port

3. **Subject Not Detected**
   - Check if subject is in supported list
   - Try variations (e.g., "algebra" for math)
   - Ensure proper language context

4. **Time Parsing Issues**
   - Use 24-hour format: "17:00"
   - Or 12-hour format: "5pm"
   - Ensure time is within 15:00-22:00 range

### Debug Mode
Set `NODE_ENV=development` to enable:
- Helper function exports
- Detailed logging
- Manual testing capabilities

## Data Consistency

The API uses the exact same tutor database as the website (`mock-tutors.js`), ensuring:
- ✅ Identical tutor profiles
- ✅ Same availability patterns
- ✅ Consistent language support
- ✅ Matching hobby categories
- ✅ Identical scoring criteria

## Performance

- **Response Time**: < 2 seconds for manual matching
- **AI Response Time**: < 5 seconds with GPT-4.1-mini
- **Fallback**: Automatic fallback to manual matching if AI fails
- **Caching**: No caching implemented (stateless design)

## Security

- ✅ Input validation and sanitization
- ✅ CORS headers properly configured
- ✅ Environment variable protection
- ✅ Error message sanitization
- ✅ Rate limiting (implemented by Vercel)

## Future Enhancements

- [ ] Add more sophisticated time parsing
- [ ] Implement conversation memory
- [ ] Add support for more subjects
- [ ] Enhanced hobby matching algorithms
- [ ] Real-time availability checking
- [ ] User preference learning

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review test logs for debugging
3. Verify environment variables
4. Test with local development first 