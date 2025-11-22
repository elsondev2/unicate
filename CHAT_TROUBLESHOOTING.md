# Chat System Troubleshooting Guide

## ❌ Error: POST /api/conversations 404 (Not Found)

### Problem
The chat routes are not found on the server, resulting in 404 errors when trying to create conversations.

### Root Cause
You're currently hitting the **production server** at `https://live-learn-hub.onrender.com`, which doesn't have the new chat routes deployed yet.

### ✅ Solution 1: Test Locally (Recommended)

#### Step 1: Ensure Local Environment
Make sure you're using `.env.local` (already configured):
```bash
VITE_API_URL="http://localhost:3001/api"
VITE_SOCKET_URL="http://localhost:3001"
```

#### Step 2: Start Local Backend
```bash
npm run server
```

You should see:
```
Server running on http://localhost:3001
Socket.io enabled for real-time updates
MongoDB connected successfully
```

#### Step 3: Start Frontend
In a new terminal:
```bash
npm run dev
```

#### Step 4: Test Chat
1. Open `http://localhost:5173`
2. Sign in or create account
3. Go to Community → Click "Chat" on a user
4. Should work now! ✅

### ✅ Solution 2: Deploy to Production

If you want to use the production server, you need to deploy the new code:

#### Step 1: Commit Changes
```bash
git add .
git commit -m "Add chat system with real-time messaging and calls"
git push
```

#### Step 2: Deploy to Render
- Render will automatically detect the push and redeploy
- Wait for deployment to complete (~5-10 minutes)
- Check Render logs for any errors

#### Step 3: Verify Deployment
Check that the new routes are available:
```bash
curl https://live-learn-hub.onrender.com/api/health
```

### 🔍 Debugging Steps

#### Check Which Server You're Using
Open browser console and look for API requests:
- `http://localhost:3001/api/...` = Local ✅
- `https://live-learn-hub.onrender.com/api/...` = Production ⚠️

#### Verify Backend is Running
```bash
# Check if server is running
curl http://localhost:3001/api/health

# Should return: {"status":"ok"}
```

#### Check Server Logs
Look for these messages when server starts:
```
Server running on http://localhost:3001
Socket.io enabled for real-time updates
MongoDB connected successfully
```

#### Test Chat Route Directly
```bash
# Get conversations (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/conversations
```

### 🐛 Common Issues

#### Issue: "Cannot GET /api/conversations"
**Cause**: Server not running or routes not registered
**Fix**: 
1. Stop server (Ctrl+C)
2. Restart: `npm run server`
3. Check for compilation errors

#### Issue: "ECONNREFUSED"
**Cause**: Backend server is not running
**Fix**: Start server with `npm run server`

#### Issue: "MongoDB connection failed"
**Cause**: MongoDB not configured or not running
**Fix**: Check MongoDB connection string in `.env`

#### Issue: "401 Unauthorized"
**Cause**: Not logged in or token expired
**Fix**: 
1. Sign out
2. Sign in again
3. Try chat feature

### 📋 Verification Checklist

Before testing chat:
- [ ] Backend server running (`npm run server`)
- [ ] Frontend running (`npm run dev`)
- [ ] Using `.env.local` (check browser network tab)
- [ ] MongoDB connected (check server logs)
- [ ] Logged in with valid account
- [ ] No console errors

### 🔧 Quick Fix Commands

```bash
# Stop all processes
# Press Ctrl+C in both terminals

# Clear node modules and reinstall (if needed)
rm -rf node_modules
npm install

# Restart backend
npm run server

# In new terminal, restart frontend
npm run dev

# Test in browser
# Open http://localhost:5173
```

### 📊 Expected Behavior

When working correctly:

1. **Create Chat**:
   - Click "Chat" button on user
   - Redirects to `/chat`
   - Shows conversation interface
   - No 404 errors in console

2. **Send Message**:
   - Type message
   - Press Enter
   - Message appears instantly
   - Other user sees it in real-time

3. **Create Group**:
   - Click group icon
   - Select users
   - Enter name
   - Group created successfully

### 🚀 Production Deployment Checklist

Before deploying to production:
- [ ] All TypeScript compiles without errors
- [ ] Tests pass locally
- [ ] Environment variables set on Render
- [ ] MongoDB connection string configured
- [ ] CORS settings allow frontend domain
- [ ] Socket.io configured for production URL

### 📝 Environment Variables for Production

Make sure these are set on Render:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### 🆘 Still Having Issues?

1. **Check Server Logs**:
   ```bash
   npm run server
   # Look for errors in output
   ```

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red errors

3. **Check Network Tab**:
   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "Fetch/XHR"
   - Look for failed requests

4. **Verify Route Files Exist**:
   ```bash
   ls server/routes/
   # Should show: chat.ts, calls.ts
   ```

5. **Check TypeScript Compilation**:
   ```bash
   npm run build
   # Should complete without errors
   ```

### ✅ Success Indicators

You'll know it's working when:
- ✅ No 404 errors in console
- ✅ Conversations load in Messages page
- ✅ Can create new chats
- ✅ Messages send and receive instantly
- ✅ Typing indicators appear
- ✅ Calls can be initiated

---

**Quick Start**: Just run `npm run server` in one terminal and `npm run dev` in another, then test at `http://localhost:5173` 🚀
