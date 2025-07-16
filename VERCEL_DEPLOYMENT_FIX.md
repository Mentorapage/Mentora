# Vercel API Deployment Fix Guide

## Issues Identified and Fixed

### ✅ Problems Found:
1. **Complex ES Module Imports**: The original `api/ai-tutor.js` had complex dynamic imports that were causing Vercel compatibility issues
2. **Overly Complex vercel.json**: The configuration had unnecessary build and route configurations that might interfere with API routes
3. **ES Module vs CommonJS**: Vercel sometimes has issues with ES modules in serverless functions

### ✅ Fixes Applied:

#### 1. Simplified API Files
- **`api/ai-tutor.js`**: Converted to CommonJS and simplified to basic functionality
- **`api/health.js`**: Converted to CommonJS and returns `{ status: "ok" }` as requested

#### 2. Simplified vercel.json
- Removed complex build configurations
- Removed route overrides that might interfere with API routes
- Kept only essential function configurations

#### 3. File Structure Verification
- ✅ `/api/ai-tutor.js` exists in correct location
- ✅ `/api/health.js` exists in correct location
- ✅ Both files have proper Vercel serverless function structure

## Current File Status

### api/ai-tutor.js
```javascript
module.exports = async function handler(req, res) {
  // Simplified handler that returns a basic response
  // Accepts POST requests with prompt and conversationState
  // Returns proper CORS headers and error handling
}
```

### api/health.js
```javascript
module.exports = function handler(req, res) {
  // Health check endpoint
  // Returns { status: "ok", message: "...", timestamp: "...", method: "...", url: "..." }
}
```

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "functions": {
    "api/ai-tutor.js": { "maxDuration": 30 },
    "api/health.js": { "maxDuration": 10 }
  }
}
```

## Next Steps

### 1. Redeploy to Vercel
```bash
# If using Vercel CLI
vercel --prod

# Or push to your connected Git repository
git add .
git commit -m "Fix Vercel API endpoints"
git push
```

### 2. Test the Endpoints
After deployment, test these URLs:

**Health Check:**
```bash
curl https://mentora-zeta.vercel.app/api/health
```
Expected response:
```json
{
  "status": "ok",
  "message": "Vercel serverless functions are working!",
  "timestamp": "2024-01-XX...",
  "method": "GET",
  "url": "/api/health"
}
```

**AI Tutor Endpoint:**
```bash
curl -X POST https://mentora-zeta.vercel.app/api/ai-tutor \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "conversationState": {"step": 0}}'
```
Expected response:
```json
{
  "type": "needs_info",
  "response": "Hello! I can help you find a tutor...",
  "conversationState": {...}
}
```

### 3. Verify Environment Variables
Make sure in your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your actual API key
3. Redeploy if you add new environment variables

### 4. Check Vercel Function Logs
If endpoints still don't work:
1. Go to Vercel dashboard → Functions tab
2. Check logs for `/api/ai-tutor` and `/api/health`
3. Look for any error messages

## Expected Behavior

✅ **Health endpoint** (`/api/health`): Should return status 200 with `{ status: "ok" }`  
✅ **AI Tutor endpoint** (`/api/ai-tutor`): Should accept POST requests and return tutor matching responses  
✅ **Method validation**: GET requests to `/api/ai-tutor` should return 405 Method Not Allowed  
✅ **CORS support**: Both endpoints should handle preflight OPTIONS requests  

## Troubleshooting

If you still get 404 errors after redeployment:

1. **Check Vercel deployment logs** for any build errors
2. **Verify file paths** - ensure files are in the `/api` folder at the root
3. **Check Vercel function logs** for runtime errors
4. **Try accessing the main site** first to ensure the deployment is complete
5. **Wait a few minutes** after deployment - Vercel sometimes takes time to propagate changes

## Test Script
Run the included test script to verify endpoints:
```bash
node test-vercel-endpoints.js
```

This will test both endpoints and provide detailed feedback on what's working or not working. 