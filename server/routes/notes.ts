import express from 'express';
import { getDatabase } from '../db.js';
import { ObjectId } from 'mongodb';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    const { search, myOnly } = req.query;
    
    let query: any = {};
    
    // Filter by owner if myOnly is true
    if (myOnly === 'true') {
      query.user_id = req.userId;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const notes = await db.collection('notes')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    // Fetch user names for each note
    const notesWithUsers = await Promise.all(
      notes.map(async (note) => {
        const user = await db.collection('users').findOne({ _id: new ObjectId(note.user_id) });
        return {
          ...note,
          user_name: user?.name || 'Unknown User'
        };
      })
    );
    
    res.json(notesWithUsers);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    // Both students and teachers can view any note
    const note = await db.collection('notes').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;
    const db = await getDatabase();
    
    const result = await db.collection('notes').insertOne({
      user_id: req.userId,
      title,
      content,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const newNote = await db.collection('notes').findOne({ _id: result.insertedId });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('note:created', newNote);
    }
    
    res.json(newNote);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body;
    const db = await getDatabase();
    
    const result = await db.collection('notes').updateOne(
      { _id: new ObjectId(req.params.id), user_id: req.userId },
      { $set: { title, content, updated_at: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const updatedNote = await db.collection('notes').findOne({ _id: new ObjectId(req.params.id) });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('note:updated', updatedNote);
    }
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    const result = await db.collection('notes').deleteOne({
      _id: new ObjectId(req.params.id),
      user_id: req.userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('note:deleted', { _id: req.params.id });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
