# Audio & Avatar Improvements

## Summary
Fixed avatar fetching, audio cover art display, and audio navigation throughout the application.

## Changes Made

### 1. Avatar Support
- **Backend**: Added `avatar_url` field to user schema
- **Backend**: Created `/auth/profile` PUT endpoint to update user profile and avatar
- **Frontend**: Updated User interface to include `avatar_url` field
- **Frontend**: Added avatar display in Sidebar component
- **Frontend**: Added avatar upload functionality in ProfileSettings with Supabase integration

### 2. Audio Cover Art
- **Fixed Display**: Changed cover art from `object-cover` to `object-contain` in AudioPlayer to prevent cropping
- **Upload Support**: Enabled cover art upload in AudioUpload component
- **Preview**: Added cover art preview before upload
- **Backend**: Added `coverArt` field support in audio creation endpoint
- **Display**: Added cover art display in AudioLessonsList cards

### 3. Audio Navigation
- **Dashboard to Player**: Made audio cards in AudioLessonsList clickable to navigate to player
- **Auto-play**: Audio player now accepts `audioId` via navigation state and auto-plays selected track
- **Preview**: Added preview button to play audio directly in dashboard without navigating

### 4. Audio Preview in Dashboard
- **Preview Button**: Added preview/stop preview button for each audio lesson
- **Inline Playback**: Audio plays directly in the dashboard without navigation
- **Stop on Navigate**: Preview stops when clicking card to go to full player

## Files Modified

### Frontend
- `src/pages/AudioPlayer.tsx` - Fixed cover art display, added navigation state handling
- `src/pages/AudioUpload.tsx` - Added cover art upload with preview
- `src/components/AudioLessonsList.tsx` - Added clickable cards, preview functionality, cover art display
- `src/components/Sidebar.tsx` - Added avatar display
- `src/pages/settings/ProfileSettings.tsx` - Added avatar upload functionality
- `src/lib/api.ts` - Added User.avatar_url field and updateProfile API function

### Backend
- `server/routes/auth.ts` - Added avatar_url to user creation, added /auth/profile endpoint
- `server/routes/audio.ts` - Added coverArt field support

## Features

### Avatar Management
- Users can upload profile pictures from Settings > Profile
- Avatars are stored in Supabase storage
- Avatars display in sidebar and throughout the app
- Supports images up to 5MB

### Audio Cover Art
- Teachers can upload cover art when uploading audio lessons
- Cover art displays properly without being cut off (object-contain with padding)
- Square images recommended (500x500px)
- Supports images up to 5MB
- Cover art shows in player and playlist sidebar

### Audio Navigation
- Click any audio card in dashboard to open in full player
- Player auto-plays the selected track
- Preview button allows quick listening without leaving dashboard
- Smooth navigation between dashboard and player

### Equalizer (EQ)
- 5-band parametric equalizer (60Hz, 250Hz, 1kHz, 4kHz, 8kHz)
- 8 preset modes: Flat, Bass Boost, Treble Boost, Vocal, Rock, Pop, Classical, Jazz
- Custom EQ with ±12dB adjustment per band
- Real-time audio processing using Web Audio API
- Visual vertical sliders for each frequency band

## Usage

### Upload Audio with Cover Art
1. Go to Upload Audio page
2. Fill in title and description
3. Select audio file
4. Select cover art image (optional)
5. Preview both before uploading
6. Click Upload Audio

### Update Profile Avatar
1. Go to Settings > Profile
2. Click on file input under Profile Picture
3. Select an image (max 5MB)
4. Avatar uploads automatically
5. Page reloads to show new avatar everywhere

### Play Audio from Dashboard
1. Go to Dashboard > Audio tab
2. Click "Preview" to play inline
3. Click anywhere on card to open in full player
4. Player opens with selected track ready to play

### Use Equalizer
1. Open audio player
2. Click "Equalizer" button below volume control
3. Choose a preset (Bass Boost, Rock, Pop, etc.) or
4. Adjust individual frequency bands manually
5. Changes apply in real-time
6. EQ settings persist during playback
