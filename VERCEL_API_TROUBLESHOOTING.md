# Vercel API Troubleshooting Guide

## Current Status
✅ `api/ai-tutor.js` file exists and has proper Vercel serverless function structure  
✅ `api/health.js` health check endpoint created  
✅ Dependencies are properly configured in `package.json`  
✅ `vercel.json` configuration is correct  
✅ ES modules compatibility fixes applied  

## Issue Analysis
The local server works (status 200), but Vercel deployment returns 405 Method Not Allowed. This suggests:
1. The serverless function is being found by Vercel
2. There's an issue with request method handling or CORS

## Debugging Steps

### 1. Test Health Check Endpoint
First, test the simple health check endpoint:
```bash
curl -X GET https://your-app.vercel.app/api/health
```

### 2. Test AI Tutor Endpoint
Test the AI tutor endpoint with proper headers:
```bash
curl -X POST https://your-app.vercel.app/api/ai-tutor \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "conversationState": {"step": 0}}'
```

### 3. Check Vercel Function Logs
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Functions tab
4. Check the logs for `/api/ai-tutor` function
5. Look for any error messages

### 4. Verify Environment Variables
Make sure `OPENAI_API_KEY` is set in Vercel:
1. Go to Vercel dashboard → Project Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your actual API key
3. Redeploy the project

### 5. Test Local Development
Run the test script to verify local functionality:
```bash
node test-vercel-api.js
```

## Common Issues and Solutions

### Issue: 405 Method Not Allowed
**Cause**: Vercel might be treating the request as GET instead of POST
**Solution**: Ensure proper Content-Type header and request body

### Issue: Module Import Errors
**Cause**: ES modules compatibility issues
**Solution**: ✅ Already fixed with dynamic imports

### Issue: Environment Variables Not Available
**Cause**: OpenAI API key not set in Vercel
**Solution**: Add environment variable in Vercel dashboard

### Issue: Function Timeout
**Cause**: Function takes too long to respond
**Solution**: ✅ Already configured with 30s timeout in vercel.json

## Deployment Checklist

- [ ] `api/ai-tutor.js` exists and has proper export
- [ ] `package.json` has all required dependencies
- [ ] `vercel.json` is properly configured
- [ ] Environment variables are set in Vercel
- [ ] No hardcoded localhost URLs in frontend
- [ ] CORS headers are properly set
- [ ] Function handles OPTIONS requests for CORS preflight

## Next Steps

1. **Redeploy to Vercel** after making sure environment variables are set
2. **Test the health endpoint** first: `/api/health`
3. **Test the AI tutor endpoint** with proper POST request
4. **Check Vercel function logs** for detailed error messages
5. **Update frontend** to use relative URLs (already done)

## Test Commands

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test AI tutor endpoint
curl -X POST https://your-app.vercel.app/api/ai-tutor \
  -H "Content-Type: application/json" \
  -d '{"prompt": "I need help with math", "conversationState": {"step": 0}}'

# Test local development
node test-vercel-api.js
```

## Expected Behavior

✅ Health endpoint should return: `{"message": "Vercel serverless functions are working!"}`  
✅ AI tutor endpoint should return: `{"type": "needs_info", "response": "..."}`  
✅ Local server should work with status 200  
✅ Vercel deployment should work with status 200  

If you're still getting 404 or 405 errors, the issue is likely:
1. Environment variables not set in Vercel
2. Function not being deployed properly
3. CORS preflight issues

Check the Vercel function logs for specific error messages. 