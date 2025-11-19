import express from 'express';
import { getDatabase } from '../db.js';
import { ObjectId } from 'mongodb';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get all audio lessons
router.get('/', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    const { search, myOnly, tags } = req.query;
    
    let query: any = {};
    
    // Filter by owner if myOnly is true
    if (myOnly === 'true') {
      query.user_id = req.userId;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tags filter
    if (tags) {
      const tagArray = (tags as string).split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }
    
    const audioLessons = await db.collection('audio_lessons')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    // Fetch user names for each audio lesson (if not already present)
    const lessonsWithUsers = await Promise.all(
      audioLessons.map(async (lesson) => {
        if (!lesson.user_name) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(lesson.user_id) });
          return {
            ...lesson,
            user_name: user?.name || 'Unknown User'
          };
        }
        return lesson;
      })
    );
    
    res.json(lessonsWithUsers);
  } catch (error) {
    console.error('Get audio lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch audio lessons' });
  }
});

// Get single audio lesson
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    const audioLesson = await db.collection('audio_lessons').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!audioLesson) {
      return res.status(404).json({ error: 'Audio lesson not found' });
    }
    
    res.json(audioLesson);
  } catch (error) {
    console.error('Get audio lesson error:', error);
    res.status(500).json({ error: 'Failed to fetch audio lesson' });
  }
});

// Create audio lesson (stores base64 audio in MongoDB)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, description, audioUrl, coverArt, fileName, fileSize, mimeType, duration } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!audioUrl) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    const db = await getDatabase();
    
    // Get user name for the audio lesson
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
    
    const result = await db.collection('audio_lessons').insertOne({
      user_id: req.userId,
      user_name: user?.name || 'Unknown User',
      title,
      description: description || '',
      audioUrl,
      coverArt: coverArt || '',
      duration: duration || 0,
      fileName: fileName || 'audio.mp3',
      fileSize: fileSize || 0,
      mimeType: mimeType || 'audio/mpeg',
      tags: req.body.tags || [],
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const newAudio = await db.collection('audio_lessons').findOne({ _id: result.insertedId });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('audio:created', newAudio);
    }
    
    console.log('Audio lesson created:', newAudio?._id);
    res.json(newAudio);
  } catch (error) {
    console.error('Create audio lesson error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create audio lesson';
    res.status(500).json({ error: errorMessage });
  }
});

// Update audio lesson
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { title, description, coverArt, tags } = req.body;
    const db = await getDatabase();
    
    const updateData: unknown = { updated_at: new Date() };
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (coverArt !== undefined) updateData.coverArt = coverArt;
    if (tags !== undefined) updateData.tags = tags;
    
    const result = await db.collection('audio_lessons').updateOne(
      { _id: new ObjectId(req.params.id), user_id: req.userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Audio lesson not found or unauthorized' });
    }
    
    const updatedAudio = await db.collection('audio_lessons').findOne({ _id: new ObjectId(req.params.id) });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('audio:updated', updatedAudio);
    }
    
    res.json(updatedAudio);
  } catch (error) {
    console.error('Update audio lesson error:', error);
    res.status(500).json({ error: 'Failed to update audio lesson' });
  }
});

// Delete audio lesson
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    const result = await db.collection('audio_lessons').deleteOne({
      _id: new ObjectId(req.params.id),
      user_id: req.userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Audio lesson not found' });
    }
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('audio:deleted', { _id: req.params.id });
    }
    
    res.json({ success: true, _id: req.params.id });
  } catch (error) {
    console.error('Delete audio lesson error:', error);
    res.status(500).json({ error: 'Failed to delete audio lesson' });
  }
});

export default router;
