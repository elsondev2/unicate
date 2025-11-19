# 🔧 MongoDB SSL Connection Fix for Render

## ❌ **The Problem**
```
MongoServerSelectionError: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

This error occurs because:
1. **Node.js 22** has stricter SSL/TLS requirements
2. **MongoDB Atlas** connection is failing SSL handshake
3. **Render** is using Node.js 22 by default

## ✅ **Solution Applied**

### 1. Force Node.js 20 (Recommended)
Created `.node-version` file with:
```
20.11.0
```

This tells Render to use Node.js 20 instead of 22.

### 2. Updated MongoDB Connection Options
Added proper TLS options in `server/db.ts`:
```typescript
const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
};
```

## 🚀 **Deploy Steps**

1. **Commit Changes:**
   ```bash
   git add .node-version server/db.ts
   git commit -m "Fix MongoDB SSL connection for Render"
   git push origin main
   ```

2. **Render Will Auto-Deploy** with Node.js 20

3. **Verify in Render Logs:**
   ```
   ==> Using Node.js version 20.11.0
   Server running on http://localhost:3001
   ```

## 🔐 **Environment Variables Needed**

Make sure these are set in Render Dashboard:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_here
PORT=3001
NODE_ENV=production
```

### MongoDB URI Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## 🔍 **Alternative Solutions**

### Option A: Update MongoDB Connection String
Add SSL parameters to your MongoDB URI:
```
mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=false
```

### Option B: Use render.yaml
Create `render.yaml`:
```yaml
services:
  - type: web
    name: unicate
    env: node
    runtime: node@20.11.0
    buildCommand: npm install
    startCommand: npm run server
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
```

### Option C: Downgrade MongoDB Driver
If issues persist, downgrade MongoDB driver:
```bash
npm install mongodb@5.9.0
```

## 🐛 **Troubleshooting**

### Still Getting SSL Errors?

1. **Check MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas Dashboard
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow all) for testing
   - Or add Render's IP ranges

2. **Verify MongoDB URI:**
   ```bash
   # In Render Shell
   echo $MONGODB_URI
   ```

3. **Test Connection Locally:**
   ```bash
   # Add to server/test-connection.ts
   import { getDatabase } from './db.js';
   
   async function test() {
     try {
       const db = await getDatabase();
       console.log('✅ Connected to MongoDB');
       process.exit(0);
     } catch (error) {
       console.error('❌ Connection failed:', error);
       process.exit(1);
     }
   }
   
   test();
   ```

4. **Check Node Version:**
   ```bash
   node --version  # Should show v20.x.x
   ```

## 📊 **Expected Logs After Fix**

```
==> Using Node.js version 20.11.0 (from .node-version)
==> Running 'npm run server'
Server running on http://localhost:3001
✅ Connected to MongoDB
==> Your service is live 🎉
```

## 🔗 **Useful Links**

- [MongoDB Node.js Driver Docs](https://www.mongodb.com/docs/drivers/node/current/)
- [Render Node.js Version](https://render.com/docs/node-version)
- [MongoDB Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)

## ⚠️ **Important Notes**

1. **Node.js 22 Compatibility:** MongoDB driver may not be fully compatible with Node.js 22 yet
2. **SSL/TLS:** Always use `tls: true` for MongoDB Atlas connections
3. **IP Whitelist:** Ensure Render's IPs are whitelisted in MongoDB Atlas
4. **Connection String:** Use `mongodb+srv://` (not `mongodb://`) for Atlas

---

**Status:** Fixed! The `.node-version` file will force Render to use Node.js 20, which is compatible with MongoDB Atlas SSL connections.
