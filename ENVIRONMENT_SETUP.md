# Environment Variables Setup

This document explains how to configure environment variables for the Mentora project.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# EmailJS Configuration
EMAILJS_PUBLIC_KEY=jqDn0eJgHsEGzhMjA
EMAILJS_SERVICE_ID=service_ifxv35f
EMAILJS_TEMPLATE_ID=template_dw4xdjj

# Server Configuration
PORT=3001
HOST=localhost
```

## Environment Variable Details

### OpenAI API Key
- **Variable**: `OPENAI_API_KEY`
- **Description**: Your OpenAI API key for AI tutor functionality
- **Format**: `sk-proj-...`
- **Required**: Yes

### EmailJS Configuration
- **Variables**: 
  - `EMAILJS_PUBLIC_KEY`: Public key for EmailJS service
  - `EMAILJS_SERVICE_ID`: Service ID for EmailJS
  - `EMAILJS_TEMPLATE_ID`: Template ID for EmailJS
- **Description**: Configuration for the teacher application form email service
- **Required**: Yes (for teacher form functionality)

### Server Configuration
- **Variables**:
  - `PORT`: Server port (default: 3001)
  - `HOST`: Server host (default: localhost)
- **Description**: Server configuration for the backend
- **Required**: No (has defaults)

## Build Process

### Development
For development, the system uses fallback values if environment variables are not set:

```bash
npm run build:dev
npm run dev
```

### Production
For production, inject environment variables into the frontend config:

```bash
npm run build:prod
npm start
```

## Security Notes

1. **Never commit the `.env` file** - it's already in `.gitignore`
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly
4. **Monitor API usage** to prevent unexpected charges

## Troubleshooting

### Frontend Configuration Issues
If EmailJS is not working:
1. Check that `config.js` is being loaded
2. Verify `window.EMAILJS_CONFIG` is set correctly
3. Check browser console for configuration logs

### Backend Configuration Issues
If the server won't start:
1. Verify `.env` file exists and has correct format
2. Check that `OPENAI_API_KEY` is valid
3. Ensure `PORT` is not already in use

### Environment Variable Not Loading
1. Restart the server after changing `.env`
2. Check for typos in variable names
3. Ensure no spaces around `=` in `.env` file 