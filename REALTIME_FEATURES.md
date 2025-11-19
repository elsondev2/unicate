# Real-time Features & Search Guide

## Overview

Your Unicate app now has real-time updates and comprehensive search functionality powered by Socket.io.

## How to Use Real-time Updates

### Automatic Updates

Content updates automatically across all connected users:

1. **Notes** - When anyone creates, edits, or deletes a note
2. **Mind Maps** - When anyone creates, edits, or deletes a mind map
3. **Audio Lessons** - When anyone uploads or deletes audio

### Connection Status

Check the browser console to see:
```
Socket.io connected: abc123
```

## Search Functionality

### Search Notes

```typescript
import { getNotes } from '@/lib/api';

// Search all notes
const notes = await getNotes('javascript');

// Get only my notes
const myNotes = await getNotes('', true);

// Search my notes
const searchResults = await getNotes('react', true);
```

### Search Mind Maps

```typescript
import { getMindMaps } from '@/lib/api';

// Search all mind maps
const maps = await getMindMaps('algorithms');

// Get only my mind maps
const myMaps = await getMindMaps('', true);
```

### Search Audio Lessons

```typescript
import { getAudioLessons } from '@/lib/api';

// Search all audio
const audio = await getAudioLessons('lecture');

// Get only my audio
const myAudio = await getAudioLessons('', true);
```

## Implementing Real-time Updates in Components

### Example: Notes List Component

```typescript
import { useEffect, useState } from 'react';
import { getNotes, onNoteCreated, onNoteUpdated, onNoteDeleted } from '@/lib/api';

function NotesList() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    // Load initial notes
    loadNotes();

    // Listen for real-time updates
    onNoteCreated((newNote) => {
      setNotes(prev => [newNote, ...prev]);
    });

    onNoteUpdated((updatedNote) => {
      setNotes(prev => prev.map(note => 
        note._id === updatedNote._id ? updatedNote : note
      ));
    });

    onNoteDeleted((noteId) => {
      setNotes(prev => prev.filter(note => note._id !== noteId));
    });
  }, []);

  const loadNotes = async () => {
    const data = await getNotes();
    setNotes(data);
  };

  return (
    <div>
      {notes.map(note => (
        <div key={note._id}>{note.title}</div>
      ))}
    </div>
  );
}
```

## Socket.io Events Reference

### Notes Events
- `note:created` - New note created
- `note:updated` - Note updated
- `note:deleted` - Note deleted

### Mind Maps Events
- `mindmap:created` - New mind map created
- `mindmap:updated` - Mind map updated
- `mindmap:deleted` - Mind map deleted

### Audio Events
- `audio:created` - New audio uploaded
- `audio:deleted` - Audio deleted

## Backend Implementation

### Emitting Events from Routes

```typescript
// In your route handler
const io = req.app.get('io');

// Create note
const note = await notesCollection.insertOne(noteData);
io.emit('note:created', note);

// Update note
const updated = await notesCollection.findOneAndUpdate(...);
io.emit('note:updated', updated);

// Delete note
await notesCollection.deleteOne({ _id: noteId });
io.emit('note:deleted', noteId);
```

## Performance Tips

1. **Debounce Search** - Add a delay before searching
2. **Limit Results** - Paginate large result sets
3. **Cleanup Listeners** - Remove event listeners when components unmount
4. **Optimize Queries** - Use MongoDB indexes for faster searches

## Troubleshooting

### Socket Not Connecting
- Check browser console for errors
- Verify VITE_SOCKET_URL is correct
- Ensure user is logged in

### Updates Not Appearing
- Check if Socket.io is connected
- Verify event names match exactly
- Check server logs for emit calls

### Search Not Working
- Verify API_URL is correct
- Check network tab for failed requests
- Ensure authentication token is valid
