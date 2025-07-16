# Vercel Deployment Guide

This guide explains how to deploy your Mentora application to Vercel with the AI tutor functionality.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **OpenAI API Key**: Make sure you have a valid OpenAI API key

## Environment Variables Setup

Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
EMAILJS_PUBLIC_KEY=jqDn0eJgHsEGzhMjA
EMAILJS_SERVICE_ID=service_ifxv35f
EMAILJS_TEMPLATE_ID=template_dw4xdjj
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment

### Option 2: Deploy via GitHub Integration

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the project structure
3. Configure environment variables in the Vercel dashboard
4. Deploy

## Project Structure

The deployment uses the following structure:

```
├── api/
│   └── ai-tutor.js          # Vercel serverless function
├── index.html               # Main website
├── script.js                # Frontend JavaScript
├── mock-tutors.js           # Tutor data
├── config.js                # Configuration
├── package.json             # Dependencies
├── vercel.json              # Vercel configuration
└── .env                     # Local environment (not deployed)
```

## How It Works

1. **Frontend**: Serves static files (HTML, CSS, JS) from the root
2. **API**: The `/api/ai-tutor` endpoint is handled by the serverless function
3. **Environment Variables**: Accessed via `process.env` in the serverless function

## Testing the Deployment

After deployment, test the AI tutor functionality:

1. Open your deployed website
2. Click the "AI Support" button
3. Start a conversation with the AI tutor
4. Verify that tutor matching works correctly

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Error: "OpenAI API key not found"
   - Solution: Add `OPENAI_API_KEY` to Vercel environment variables

2. **CORS Errors**
   - Error: "Access to fetch at '/api/ai-tutor' from origin..."
   - Solution: The serverless function includes CORS headers

3. **Function Timeout**
   - Error: "Function execution timeout"
   - Solution: The function is configured with a 30-second timeout

### Debugging

1. Check Vercel function logs in the dashboard
2. Use browser developer tools to inspect network requests
3. Verify environment variables are correctly set

## Local Development

For local development, you can still use the Express server:

```bash
npm start
```

This will run the server on `http://localhost:3001` for local testing.

## Production vs Development

- **Development**: Uses Express server on localhost:3001
- **Production**: Uses Vercel serverless functions at `/api/ai-tutor`

The frontend automatically adapts to the environment by using relative paths. 