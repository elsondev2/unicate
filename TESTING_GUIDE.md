# Testing & Deployment Guide

## 🔧 Local Development Setup

### Step 1: Start the Backend Server

```bash
npm run server
```

This will start the Express server on `http://localhost:3001`

**Expected Output:**
```
Server running on http://localhost:3001
Socket.io enabled for real-time updates
MongoDB connected
```

### Step 2: Start the Frontend (in a new terminal)

```bash
npm run dev
```

This will start Vite dev server on `http://localhost:5173`

### Step 3: Test Signup

1. Open `http://localhost:5173/auth`
2. Click "Sign Up" tab
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123
   - Role: Student or Teacher
4. Click "Create Account"

**What to Check:**
- Browser console should show: `Attempting signup...`
- Backend console should show: `Signup attempt for: test@example.com`
- If successful: Redirects to `/dashboard`
- If error: Red error message appears

### Step 4: Test Signin

1. Go to `http://localhost:5173/auth`
2. Use the credentials you just created
3. Click "Sign In"

**What to Check:**
- Browser console: `Attempting signin...`
- Backend console: `Signin attempt for: test@example.com`
- Socket.io console: `Socket.io connected: [socket-id]`

## 🐛 Troubleshooting Local Issues

### Issue: "Creating account..." never finishes

**Possible Causes:**
1. Backend server not running
2. MongoDB connection failed
3. Network timeout

**Solutions:**
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Check backend logs for errors
# Look for MongoDB connection errors
```

### Issue: "Failed to sign up" error

**Check Backend Logs For:**
- `Signup error details:` - Shows the actual error
- MongoDB connection errors
- JWT_SECRET missing

**Common Fixes:**
```bash
# Verify .env file exists in server folder
cat server/.env

# Should contain:
# MONGODB_URI=...
# JWT_SECRET=...
# PORT=3001
```

### Issue: Socket.io not connecting

**Check:**
1. Backend shows: `Socket.io enabled for real-time updates`
2. Browser console shows: `Socket.io connected: [id]`
3. Network tab shows WebSocket connection

**Fix:**
```bash
# Restart both frontend and backend
# Make sure VITE_SOCKET_URL is correct in .env
```

## 🚀 Production Deployment

### Step 1: Update Environment Files

**For Production (.env.production):**
```env
VITE_API_URL="https://live-learn-hub.onrender.com/api"
VITE_SOCKET_URL="https://live-learn-hub.onrender.com"
```

**For Local Development (.env):**
```env
VITE_API_URL="http://localhost:3001/api"
VITE_SOCKET_URL="http://localhost:3001"
```

### Step 2: Build for Production

```bash
npm run build
```

**Expected Output:**
```
✓ 2094 modules transformed.
dist/index.html
dist/assets/index-[hash].css
dist/assets/index-[hash].js
✓ built in [time]
```

### Step 3: Commit and Push

```bash
git add .
git commit -m "Fix: Enhanced auth error handling, added Socket.io real-time updates"
git push origin main
```

### Step 4: Configure Render Environment Variables

In Render Dashboard, set:

```
MONGODB_URI=mongodb+srv://elsonyt25_db_user:Myy9YBE9SSMirLzA@cluster0.o37zici.mongodb.net/live-learn-hub?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://live-learn-hub.onrender.com
```

### Step 5: Monitor Deployment

Watch Render logs for:
```
✓ Build successful
✓ Server running on http://localhost:3001
✓ Socket.io enabled for real-time updates
✓ MongoDB connected
```

### Step 6: Test Production

1. Go to `https://live-learn-hub.onrender.com/auth`
2. Try creating an account
3. Check browser console for errors
4. Verify Socket.io connection

## 📊 What's New

### Enhanced Error Handling
- ✅ Detailed console logging for debugging
- ✅ 30-second timeout on API requests
- ✅ Visual error messages in UI
- ✅ Better error messages from backend

### Real-time Updates
- ✅ Socket.io client automatically connects on login
- ✅ Real-time events for notes, mindmaps, and audio
- ✅ Auto-reconnection on disconnect

### Search Functionality
- ✅ Search across all content types
- ✅ Filter by "My Content"
- ✅ Case-insensitive search

## 🔍 Debugging Tips

### Check API Connectivity

```bash
# Test health endpoint
curl https://live-learn-hub.onrender.com/api/health

# Should return: {"status":"ok"}
```

### Check Browser Console

Look for these messages:
```
API Request: https://live-learn-hub.onrender.com/api/auth/signup
API Response: 200 OK
Socket.io connected: abc123
```

### Check Backend Logs

Look for these messages:
```
Signup attempt for: user@example.com
Connecting to database...
Checking for existing user...
Hashing password...
Creating user...
User created with ID: [id]
Generating token...
Signup successful for: user@example.com
```

## ⚠️ Common Errors

### "Request timeout - server may be slow or unavailable"
- Backend is not responding
- Check if Render service is running
- Check MongoDB connection

### "User already exists"
- Email is already registered
- Try signing in instead
- Or use a different email

### "All fields are required"
- Make sure all form fields are filled
- Check for empty spaces

### "Password must be at least 6 characters"
- Use a longer password
- Minimum 6 characters required

## 📝 Next Steps

After successful deployment:
1. Test all features thoroughly
2. Create test accounts (teacher and student)
3. Test real-time updates with multiple browsers
4. Test search functionality
5. Monitor error logs for 24 hours
