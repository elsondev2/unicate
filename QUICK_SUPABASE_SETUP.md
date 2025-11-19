# Quick Supabase Setup - Do This Now!

## ⚡ 3-Minute Setup

### Step 1: Go to Supabase Dashboard
🔗 https://supabase.com/dashboard/project/vxcypcdfhjkoojiietdk/storage/buckets

### Step 2: Create Buckets

#### Create "audio-lessons" bucket:
1. Click **"New bucket"** button
2. Name: `audio-lessons`
3. ✅ Check **"Public bucket"**
4. Click **"Create bucket"**

#### Create "avatars" bucket:
1. Click **"New bucket"** button
2. Name: `avatars`
3. ✅ Check **"Public bucket"**
4. Click **"Create bucket"**

### Step 3: Set Policies for audio-lessons

1. Click on `audio-lessons` bucket
2. Click **"Policies"** tab
3. Click **"New policy"** → **"Get started quickly"** → **"Allow public access"**
4. This will create policies for:
   - ✅ Public read access
   - ✅ Authenticated uploads
   - ✅ Authenticated deletes

### Step 4: Set Policies for avatars

1. Click on `avatars` bucket
2. Click **"Policies"** tab
3. Click **"New policy"** → **"Get started quickly"** → **"Allow public access"**

### Step 5: Test It!

1. Restart your app: `npm run dev`
2. Go to `/audio/upload`
3. Upload an audio file
4. ✅ Should work now!

## That's It!

Your app will now:
- ✅ Upload audio files to Supabase Storage
- ✅ Upload avatars to Supabase Storage
- ✅ Store only URLs in MongoDB (not the files)
- ✅ Serve files from Supabase CDN (fast!)

## Verify It Worked

After uploading, check:
1. Supabase Dashboard → Storage → audio-lessons
2. You should see folders with user IDs
3. Inside folders, you'll see audio files

## If You Get Errors

**"Bucket not found"**
- Make sure bucket name is exactly: `audio-lessons` (lowercase, with dash)
- Refresh the page

**"Permission denied"**
- Make sure you clicked "Allow public access" in policies
- Check that bucket is marked as PUBLIC

**Still not working?**
- Send me a screenshot of your Supabase Storage page
- Check browser console for specific error message
