# Implementation Plan - Remaining Features

## ✅ Completed Features

### 1. Audio Visualizer with Dynamic Gradients
- **Enhanced waveform visualizer** synced to music playback
- **Color extraction** from cover art using canvas API
- **Dynamic gradient background** using extracted colors
- **64-bar frequency visualization** with glow effects
- **Real-time animation** using Web Audio API AnalyserNode
- **Increased opacity** (60%) for better visibility
- **Glow effects** on visualizer bars

### 2. Reordered Controls
- **New order**: EQ → Queue | Shuffle → Previous → Play/Pause → Next → Repeat → | → Volume → Volume Slider
- All controls centered in bottom bar
- Proper dividers between sections

### 3. Mobile-Optimized Layout
- **Cover art positioned lower** on mobile for better ergonomics
- **Smaller cover art** on mobile (280px vs 384px)
- **Queue as right sidebar** (off by default)
- **Fixed sidebar** with backdrop overlay on mobile
- **Smooth slide-in animation** for queue
- **Touch-friendly controls** with proper sizing

## 🚧 Remaining Features to Implement

### 3. Edit Function for Audio Lessons
**Backend** (✅ Completed):
- Added PUT endpoint `/audio/:id` with tags support
- Only owner can edit their audio lessons
- Can update: title, description, coverArt, tags

**Frontend** (To Do):
- Add Edit button to AudioLessonsList for owned lessons
- Create EditAudioModal component with:
  - Title input
  - Description textarea
  - Cover art upload/change
  - Tags input (comma-separated or chip-based)
  - Save/Cancel buttons
- Show edit icon next to delete button for owned lessons

### 4. Tags System
**Backend** (✅ Completed):
- Added `tags` array field to audio_lessons collection
- Added tags filter in GET /audio endpoint
- Tags searchable in search query

**Frontend** (To Do):
- Add tags input to AudioUpload component
- Display tags as chips/badges on audio cards
- Add tag filter dropdown in dashboard
- Click tag to filter by that tag
- Multi-tag selection support

### 5. Filters and Search in Dashboard
**Components to Update**:
- `AudioLessonsList.tsx`
- `NotesList.tsx`
- `MindMapsList.tsx`

**Features to Add**:
- Search input at top of each tab
- Filter dropdown (My Items / All Items / By Tags)
- Sort options (Newest / Oldest / Title A-Z)
- Clear filters button
- Show active filter count

**UI Layout**:
```
┌─────────────────────────────────────┐
│ 🔍 Search...    [Filters ▼] [Sort ▼]│
├─────────────────────────────────────┤
│ [Tag1] [Tag2] [Tag3] [+More]        │
├─────────────────────────────────────┤
│ [Audio Card 1]  [Audio Card 2]      │
│ [Audio Card 3]  [Audio Card 4]      │
└─────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Edit Audio Modal
```typescript
// src/components/EditAudioModal.tsx
- Create modal component
- Form with title, description, tags
- Cover art upload option
- API call to PUT /audio/:id
- Refresh list on success
```

### Step 2: Tags Input Component
```typescript
// src/components/TagsInput.tsx
- Chip-based tag input
- Add/remove tags
- Autocomplete from existing tags
- Max tags limit (e.g., 10)
```

### Step 3: Update AudioUpload
```typescript
// src/pages/AudioUpload.tsx
- Add TagsInput component
- Include tags in POST request
- Show tags preview
```

### Step 4: Update AudioLessonsList
```typescript
// src/components/AudioLessonsList.tsx
- Add search input state
- Add filter state (myOnly, tags, sort)
- Add Edit button for owned lessons
- Display tags as badges
- Implement filter/search logic
- Add EditAudioModal
```

### Step 5: Repeat for Notes and MindMaps
- Add tags field to backend models
- Update routes to support tags
- Add search/filter UI
- Add edit functionality

## API Endpoints Needed

### Audio (✅ Completed)
- `GET /audio?search=query&tags=tag1,tag2&myOnly=true`
- `PUT /audio/:id` - Update audio lesson

### Notes (To Do)
- `GET /notes?search=query&tags=tag1,tag2&myNotes=true`
- `PUT /notes/:id` - Add tags field

### MindMaps (To Do)
- `GET /mindmaps?search=query&tags=tag1,tag2&myMaps=true`
- `PUT /mindmaps/:id` - Add tags field

## Database Schema Updates

### Audio Lessons (✅ Completed)
```javascript
{
  _id: ObjectId,
  user_id: string,
  user_name: string,
  title: string,
  description: string,
  audioUrl: string,
  coverArt: string,
  tags: string[], // ✅ Added
  duration: number,
  fileName: string,
  fileSize: number,
  mimeType: string,
  created_at: Date,
  updated_at: Date
}
```

### Notes (To Do)
```javascript
{
  // ... existing fields
  tags: string[], // Add this
}
```

### MindMaps (To Do)
```javascript
{
  // ... existing fields
  tags: string[], // Add this
}
```

## UI Components to Create

1. **EditAudioModal.tsx** - Modal for editing audio lessons
2. **TagsInput.tsx** - Reusable tags input component
3. **FilterBar.tsx** - Reusable filter/search bar
4. **TagBadge.tsx** - Display tag chips
5. **EditNoteModal.tsx** - Modal for editing notes
6. **EditMindMapModal.tsx** - Modal for editing mind maps

## Testing Checklist

- [ ] Audio visualizer animates with music
- [ ] Colors extracted from cover art correctly
- [ ] Edit modal opens for owned lessons only
- [ ] Tags can be added/removed
- [ ] Search filters by title, description, and tags
- [ ] Tag filter works correctly
- [ ] Sort options work
- [ ] Edit saves successfully
- [ ] Real-time updates work
- [ ] Mobile responsive

## Priority Order

1. **High Priority** (Core functionality):
   - Edit audio modal
   - Tags input component
   - Search/filter in audio tab

2. **Medium Priority** (Consistency):
   - Tags for notes
   - Tags for mind maps
   - Edit modals for notes/mind maps

3. **Low Priority** (Polish):
   - Advanced filters
   - Tag autocomplete
   - Bulk operations

## Current Status

✅ Audio player with visualizer and color extraction
✅ Backend support for tags and editing
✅ Reordered controls
⏳ Edit modal UI
⏳ Tags input component
⏳ Search/filter UI
⏳ Notes and MindMaps tags support
