# Vercel Deployment Debug Guide

This guide helps you debug and fix "Connection failed" issues with your AI tutor on Vercel.

## 🔍 Quick Diagnosis

### 1. Check Environment Variables
In your Vercel dashboard:
- Go to **Settings** → **Environment Variables**
- Ensure these are set for **Production**:
  ```
  OPENAI_API_KEY=sk-proj-your-actual-key
  EMAILJS_PUBLIC_KEY=jqDn0eJgHsEGzhMjA
  EMAILJS_SERVICE_ID=service_ifxv35f
  EMAILJS_TEMPLATE_ID=template_dw4xdjj
  ```

### 2. Check Function Logs
In Vercel dashboard:
- Go to **Functions** tab
- Click on `api/ai-tutor.js`
- Check the logs for errors

### 3. Test the API Endpoint
Use curl to test your deployed endpoint:
```bash
curl -X POST https://your-domain.vercel.app/api/ai-tutor \
  -H "Content-Type: application/json" \
  -d '{"prompt":"I need help with math","conversationState":null}'
```

## 🛠️ Common Issues & Fixes

### Issue 1: "Connection failed" in Frontend
**Cause**: Frontend can't reach the API endpoint
**Fix**: 
- ✅ Already fixed: Using relative path `/api/ai-tutor`
- ✅ CORS headers are set correctly

### Issue 2: Environment Variables Not Available
**Cause**: Variables not set or not accessible
**Fix**:
1. Set variables in Vercel dashboard
2. Redeploy after setting variables
3. Check logs for "OpenAI Key available: No"

### Issue 3: Function Timeout
**Cause**: AI response takes too long
**Fix**:
- ✅ Already configured: 30-second timeout in vercel.json

### Issue 4: Build Issues
**Cause**: Build script fails
**Fix**:
- Check build logs in Vercel dashboard
- Ensure `vercel-build.js` runs successfully

## 🔧 Manual Testing Steps

### Step 1: Test API Directly
```bash
# Replace with your actual Vercel URL
curl -X POST https://your-app.vercel.app/api/ai-tutor \
  -H "Content-Type: application/json" \
  -d '{"prompt":"math","conversationState":null}'
```

Expected response:
```json
{
  "type": "needs_info",
  "response": "Excellent! Let's find you a math tutor...",
  "conversationState": {...}
}
```

### Step 2: Check Browser Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try using the AI tutor
4. Look for the `/api/ai-tutor` request
5. Check response status and body

### Step 3: Verify Environment Variables
Add this to your serverless function temporarily:
```javascript
console.log('🔍 Environment check:', {
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasEmailJS: !!process.env.EMAILJS_PUBLIC_KEY,
  nodeEnv: process.env.NODE_ENV
});
```

## 🚀 Deployment Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] Variables marked for "Production" environment
- [ ] Build script (`vercel-build.js`) runs successfully
- [ ] API endpoint responds to direct curl requests
- [ ] CORS headers are set correctly
- [ ] No hardcoded localhost URLs in frontend
- [ ] Function logs show successful execution

## 📊 Debugging Commands

### Check Function Status
```bash
# In Vercel CLI
vercel logs your-project-name
```

### Test Local Development
```bash
# Test the serverless function locally
node test-vercel-function.js
```

### Check Build Process
```bash
# Test the build script
npm run vercel-build
```

## 🔍 Log Analysis

### Good Logs (Success)
```
🚀 AI Tutor endpoint called
📝 Method: POST
🔑 OpenAI Key available: Yes
📨 Request body: { prompt: "I need help with math...", conversationState: null }
🤖 Using EXACT filter logic for AI response
✅ Response generated successfully
```

### Bad Logs (Issues)
```
🚀 AI Tutor endpoint called
🔑 OpenAI Key available: No  ← Environment variable missing
❌ Error in AI tutor endpoint: OpenAIError: API key missing
```

## 🆘 Still Having Issues?

1. **Check Vercel Function Logs**: Look for specific error messages
2. **Verify Environment Variables**: Ensure they're set for Production
3. **Test API Directly**: Use curl to isolate frontend vs backend issues
4. **Check Build Logs**: Ensure the build process completes successfully
5. **Redeploy**: Sometimes a fresh deployment fixes issues

## 📞 Support

If you're still experiencing issues:
1. Share the Vercel function logs
2. Share the browser network tab screenshot
3. Share the curl test results
4. Check if the issue is intermittent or consistent 