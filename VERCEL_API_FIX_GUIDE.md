# Vercel API Fix Guide

## ✅ Issues Fixed

### 1. **Simplified API Files**
- **`api/health.js`**: Replaced with exact boilerplate code
- **`api/ai-tutor.js`**: Replaced with exact boilerplate code
- Both files now use simple CommonJS exports

### 2. **Simplified vercel.json**
- Removed complex build configurations
- Removed function-specific settings that might cause conflicts
- Now uses minimal configuration: `{ "version": 2 }`

### 3. **File Structure Verified**
- ✅ `api/health.js` exists and is valid
- ✅ `api/ai-tutor.js` exists and is valid
- ✅ No conflicting files (like `api.d.ts` or `public-api.js`)
- ✅ Both files have proper syntax (tested with `node -c`)

## 📁 Current API Files

### `api/health.js`
```javascript
module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Health check passed",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
  });
};
```

### `api/ai-tutor.js`
```javascript
module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Temporary test response
  res.status(200).json({ reply: "AI tutor response" });
};
```

### `vercel.json`
```json
{
  "version": 2
}
```

## 🚀 Deployment Steps

### 1. **Commit and Push Changes**
```bash
git add .
git commit -m "Fix Vercel API endpoints with simplified boilerplate"
git push
```

### 2. **Redeploy on Vercel**
- Go to your Vercel dashboard
- Trigger a new deployment
- Wait for deployment to complete

### 3. **Test the Endpoints**

#### Test Health Endpoint (GET)
```bash
curl -X GET https://mentora-zeta.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Health check passed",
  "timestamp": "2024-01-XX...",
  "method": "GET",
  "url": "/api/health"
}
```

#### Test AI Tutor Endpoint (POST)
```bash
curl -X POST https://mentora-zeta.vercel.app/api/ai-tutor \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "conversationState": {}}'
```

**Expected Response:**
```json
{
  "reply": "AI tutor response"
}
```

### 4. **Test Method Not Allowed (GET to AI Tutor)**
```bash
curl -X GET https://mentora-zeta.vercel.app/api/ai-tutor
```

**Expected Response:**
```json
{
  "error": "Method Not Allowed"
}
```

## 🔍 Troubleshooting

### If endpoints still return 404:

1. **Check Vercel Logs**
   - Go to Vercel dashboard → Functions tab
   - Check for any deployment errors

2. **Verify File Names**
   - Ensure files are exactly named: `health.js` and `ai-tutor.js`
   - No extra extensions or hidden characters

3. **Check Vercel Configuration**
   - Ensure no `vercel.json` routing conflicts
   - Verify project is set to Node.js runtime

4. **Clear Vercel Cache**
   - Sometimes Vercel caches old configurations
   - Try redeploying with "Clear cache and deploy"

### If endpoints work but return errors:

1. **Check Function Logs**
   - Vercel dashboard → Functions → View logs
   - Look for runtime errors

2. **Test Locally**
   - Use the provided test script: `node test-vercel-function.js`

## 📞 Next Steps

After successful deployment:

1. **Verify both endpoints work**
2. **Replace boilerplate with full functionality**
3. **Add proper error handling and CORS**
4. **Test with your frontend application**

## 🎯 Success Criteria

- ✅ `GET /api/health` returns `{ "status": "ok" }`
- ✅ `POST /api/ai-tutor` returns `{ "reply": "AI tutor response" }`
- ✅ `GET /api/ai-tutor` returns `{ "error": "Method Not Allowed" }`
- ✅ No 404 errors on either endpoint 