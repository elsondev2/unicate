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
      query.title = { $regex: search, $options: 'i' };
    }
    
    const mindMaps = await db.collection('mind_maps')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    // Fetch user names for each mind map
    const mapsWithUsers = await Promise.all(
      mindMaps.map(async (map) => {
        const user = await db.collection('users').findOne({ _id: new ObjectId(map.user_id) });
        return {
          ...map,
          user_name: user?.name || 'Unknown User'
        };
      })
    );
    
    res.json(mapsWithUsers);
  } catch (error) {
    console.error('Get mind maps error:', error);
    res.status(500).json({ error: 'Failed to fetch mind maps' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    // Both students and teachers can view any mind map
    const mindMap = await db.collection('mind_maps').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!mindMap) {
      return res.status(404).json({ error: 'Mind map not found' });
    }
    
    res.json(mindMap);
  } catch (error) {
    console.error('Get mind map error:', error);
    res.status(500).json({ error: 'Failed to fetch mind map' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, nodes, edges } = req.body;
    const db = await getDatabase();
    
    const result = await db.collection('mind_maps').insertOne({
      user_id: req.userId,
      title,
      nodes,
      edges,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const newMindMap = await db.collection('mind_maps').findOne({ _id: result.insertedId });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('mindmap:created', newMindMap);
    }
    
    res.json(newMindMap);
  } catch (error) {
    console.error('Create mind map error:', error);
    res.status(500).json({ error: 'Failed to create mind map' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { title, nodes, edges } = req.body;
    const db = await getDatabase();
    
    const result = await db.collection('mind_maps').updateOne(
      { _id: new ObjectId(req.params.id), user_id: req.userId },
      { $set: { title, nodes, edges, updated_at: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Mind map not found' });
    }
    
    const updatedMindMap = await db.collection('mind_maps').findOne({ _id: new ObjectId(req.params.id) });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('mindmap:updated', updatedMindMap);
    }
    
    res.json(updatedMindMap);
  } catch (error) {
    console.error('Update mind map error:', error);
    res.status(500).json({ error: 'Failed to update mind map' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    const result = await db.collection('mind_maps').deleteOne({
      _id: new ObjectId(req.params.id),
      user_id: req.userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Mind map not found' });
    }
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('mindmap:deleted', { _id: req.params.id });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete mind map error:', error);
    res.status(500).json({ error: 'Failed to delete mind map' });
  }
});

export default router;
