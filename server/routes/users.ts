import express from 'express';
import { getDatabase } from '../db.js';
import { ObjectId } from 'mongodb';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get all users
router.get('/', async (req: AuthRequest, res) => {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    
    const users = await usersCollection
      .find({}, { projection: { password: 0 } }) // Exclude password
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const { name, bio, phone, location } = req.body;
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          name,
          bio,
          phone,
          location,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(req.userId) },
      { projection: { password: 0 } }
    );
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update user avatar
router.put('/avatar', async (req: AuthRequest, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar data is required' });
    }
    
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          avatar,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, avatar });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

export default router;
