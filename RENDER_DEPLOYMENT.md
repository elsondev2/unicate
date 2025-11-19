# 🚀 Render Deployment Guide for Unicate

## 📋 **Quick Answer**

### For Static Site (Frontend Only):
```bash
Build Command: npm install && npm run build
Start Command: npm run preview
Publish Directory: dist
```

### For Full Stack (Frontend + Backend):
```bash
Build Command: npm install && npm run build
Start Command: node server/index.js
```

---

## 🎯 **Recommended: Full Stack Deployment**

### Step 1: Update Server to Serve Static Files

Add this to your `server/index.ts` after the routes:

```typescript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

### Step 2: Add Production Start Script

Update `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "server": "tsx watch server/index.ts",
  "start": "node server/index.js"
}
```

### Step 3: Create Render Configuration

Create `render.yaml` in root:

```yaml
services:
  - type: web
    name: unicate
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
```

---

## 🔧 **Render Dashboard Setup**

### 1. Create New Web Service
- Go to [Render Dashboard](https://dashboard.render.com/)
- Click "New +" → "Web Service"
- Connect your GitHub repository

### 2. Configure Settings

**Basic Settings:**
- **Name:** `unicate`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)

**Build & Deploy:**
- **Build Command:** 
  ```bash
  npm install && npm run build
  ```

- **Start Command:**
  ```bash
  npm start
  ```

**Advanced Settings:**
- **Auto-Deploy:** Yes
- **Health Check Path:** `/api/health`

### 3. Environment Variables

Add these in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

---

## 📦 **Alternative: Separate Deployments**

### Frontend (Static Site)
**Service Type:** Static Site

**Settings:**
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Auto-Deploy: Yes

**Environment Variables:**
```
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Backend (Web Service)
**Service Type:** Web Service

**Settings:**
- Build Command: `npm install`
- Start Command: `npm run server`
- Auto-Deploy: Yes

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-frontend.onrender.com
```

---

## 🔐 **Environment Variables Needed**

### Required:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to `production`

### Optional (if using Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

---

## 🐛 **Troubleshooting**

### Build Fails
```bash
# Check Node version (should be 18+)
# Add to render.yaml:
node: 18
```

### Server Won't Start
```bash
# Make sure start script exists in package.json
# Check logs in Render dashboard
```

### 404 on Routes
```bash
# Make sure catchall route is added to server
# Verify dist folder is being served
```

### Environment Variables Not Working
```bash
# Check they're added in Render dashboard
# Restart service after adding variables
```

---

## ✅ **Deployment Checklist**

- [ ] MongoDB database is set up and accessible
- [ ] Environment variables are configured
- [ ] Build command is correct
- [ ] Start command is correct
- [ ] Health check endpoint works (`/api/health`)
- [ ] CORS is configured for production domain
- [ ] Static files are being served
- [ ] Catchall route redirects to index.html
- [ ] Auto-deploy is enabled

---

## 🚀 **Quick Deploy Steps**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to Render Dashboard
   - New Web Service
   - Connect repository

3. **Configure**
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Add environment variables

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Visit your URL!

---

## 📊 **Expected Build Time**

- **First Deploy:** 5-10 minutes
- **Subsequent Deploys:** 2-5 minutes

---

## 💰 **Render Pricing**

- **Free Tier:** 
  - 750 hours/month
  - Spins down after 15 min inactivity
  - Good for testing

- **Starter ($7/month):**
  - Always on
  - No spin down
  - Better for production

---

## 🔗 **Useful Links**

- [Render Docs](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**Your app will be live at:** `https://unicate.onrender.com` (or your chosen name)

Good luck with your deployment! 🚀
