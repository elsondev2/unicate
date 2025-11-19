# Supabase Storage Setup Guide

## Step 1: Create Storage Buckets in Supabase

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `vxcypcdfhjkoojiietdk`

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create Audio Bucket**
   - Bucket name: `audio-lessons`
   - Public bucket: ✅ YES (check this box)
   - File size limit: 52428800 (50MB)
   - Allowed MIME types: Leave empty or add: `audio/mpeg, audio/wav, audio/ogg, audio/mp4, audio/m4a`
   - Click "Create bucket"

4. **Create Avatars Bucket** (Optional, for profile pictures)
   - Bucket name: `avatars`
   - Public bucket: ✅ YES
   - File size limit: 2097152 (2MB)
   - Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`
   - Click "Create bucket"

## Step 2: Set Bucket Policies (Important!)

### For audio-lessons bucket:

1. Click on the `audio-lessons` bucket
2. Click "Policies" tab
3. Click "New Policy"
4. Choose "For full customization"
5. Add these policies:

**Policy 1: Allow authenticated users to upload**
```sql
Policy name: Allow authenticated uploads
Allowed operation: INSERT
Target roles: authenticated
USING expression: true
WITH CHECK expression: true
```

**Policy 2: Allow public read access**
```sql
Policy name: Public read access
Allowed operation: SELECT
Target roles: public
USING expression: true
```

**Policy 3: Allow users to delete their own files**
```sql
Policy name: Allow users to delete own files
Allowed operation: DELETE
Target roles: authenticated
USING expression: (bucket_id = 'audio-lessons'::text)
```

### For avatars bucket (if created):

Same policies as above but change bucket_id to 'avatars'

## Step 3: Verify Your Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL="https://vxcypcdfhjkoojiietdk.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4Y3lwY2RmaGprb29qaWlldGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjEzMzQsImV4cCI6MjA3OTA5NzMzNH0.vgnJEwVbEIx08Uo9G1bx7y8ZWiTcOX43OtTubjnMkkw"
```

## Step 4: Test the Upload

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to `/audio/upload`
3. Try uploading an audio file
4. Check Supabase Storage dashboard to see if file appears

## Step 5: Verify Bucket Contents

1. Go to Supabase Dashboard → Storage
2. Click on `audio-lessons` bucket
3. You should see uploaded files organized by user ID

## Troubleshooting

### Error: "Bucket not found"
- Make sure you created the bucket with exact name: `audio-lessons`
- Check that bucket is set to PUBLIC
- Verify your Supabase URL and anon key are correct

### Error: "Permission denied"
- Add the storage policies (Step 2)
- Make sure policies allow INSERT for authenticated users
- Check that your anon key is valid

### Error: "File too large"
- Increase bucket file size limit in Supabase dashboard
- Current limit should be 52428800 bytes (50MB)

### Files upload but can't be accessed
- Make sure bucket is PUBLIC
- Add the "Public read access" policy
- Check the file URL format

## Expected File Structure in Supabase

```
audio-lessons/
├── [user_id_1]/
│   ├── [user_id_1]-[timestamp]-song1.mp3
│   └── [user_id_1]-[timestamp]-lecture.wav
├── [user_id_2]/
│   └── [user_id_2]-[timestamp]-audio.m4a
```

## Quick Test

After creating the bucket, test with this in browser console:

```javascript
// Test bucket exists
const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data);

// Test upload
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('audio-lessons')
  .upload('test/test.txt', file);
console.log('Upload result:', uploadData, uploadError);
```

## Alternative: Use Supabase CLI (Advanced)

If you prefer command line:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref vxcypcdfhjkoojiietdk

# Create bucket via SQL
supabase db execute "
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-lessons', 'audio-lessons', true);
"
```

## After Setup is Complete

Once buckets are created and policies are set:

1. The app will automatically upload files to Supabase
2. Files will be stored in: `audio-lessons/[user_id]/[filename]`
3. Public URLs will be generated automatically
4. MongoDB will store only the metadata and URL

## Need Help?

If you still get errors:
1. Check Supabase logs: Dashboard → Logs → Storage
2. Verify bucket name is exactly: `audio-lessons` (no spaces, lowercase)
3. Ensure bucket is marked as PUBLIC
4. Check that policies are active (green checkmark)
