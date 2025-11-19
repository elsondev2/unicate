# FINAL FIX - Supabase Public Storage (No Auth Required)

## The Problem
- MongoDB has 16MB document limit
- Audio files are too large for MongoDB
- Supabase RLS is blocking uploads
- You don't have permission to disable RLS

## The Solution
Make buckets COMPLETELY PUBLIC - no authentication needed!

## Step 1: Go to Supabase SQL Editor
https://supabase.com/dashboard/project/vxcypcdfhjkoojiietdk/sql/new

## Step 2: Run This SQL (Copy & Paste)

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;

-- Create simple public policies
CREATE POLICY "audio_public_all"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'audio-lessons')
WITH CHECK (bucket_id = 'audio-lessons');

CREATE POLICY "avatars_public_all"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');
```

## Step 3: Verify Buckets are Public

1. Go to Storage → audio-lessons → Settings (gear icon)
2. Make sure "Public bucket" is CHECKED ✅
3. Save

4. Go to Storage → avatars → Settings (gear icon)
5. Make sure "Public bucket" is CHECKED ✅
6. Save

## Step 4: Test Upload

Restart your app and try uploading audio again.

## If Still Doesn't Work

The issue is Supabase permissions. You have 2 options:

### Option A: Use Supabase Service Role Key (Bypasses RLS)
1. Go to Settings → API
2. Copy the "service_role" key (NOT anon key)
3. Add to .env: `VITE_SUPABASE_SERVICE_KEY=your_service_role_key`
4. Use this key for uploads (bypasses all RLS)

### Option B: Use External Storage Service
- Cloudinary (free tier, easy setup)
- AWS S3
- UploadThing
- Vercel Blob

I recommend Option A - using the service role key for uploads.
