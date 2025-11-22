import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../db.js';

const router = express.Router();

// Initiate a call
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const io = req.app.get('io');
    const userId = req.user.userId;
    const { conversationId, type } = req.body;

    // Verify user is participant
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      'participants.userId': userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get user info
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create call session
    const callSession = {
      conversationId,
      type,
      initiatorId: userId,
      participants: [
        {
          userId,
          userName: user.name,
          status: 'connected',
          joinedAt: new Date().toISOString(),
        },
      ],
      status: 'ringing',
      startedAt: new Date().toISOString(),
    };

    const result = await db.collection('calls').insertOne(callSession);

    const callWithId = {
      ...callSession,
      id: result.insertedId.toString(),
    };

    // Notify other participants
    io.to(`conversation:${conversationId}`).emit('incoming_call', callWithId);

    res.json(callWithId);
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// Join a call
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const io = req.app.get('io');
    const callId = req.params.id;
    const userId = req.user.userId;

    // Get user info
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update call session
    await db.collection('calls').updateOne(
      { _id: new ObjectId(callId) },
      {
        $push: {
          participants: {
            userId,
            userName: user.name,
            status: 'connected',
            joinedAt: new Date().toISOString(),
          },
        },
        $set: { status: 'active' },
      }
    );

    const call = await db.collection('calls').findOne({ _id: new ObjectId(callId) });

    // Notify other participants
    io.to(`conversation:${call?.conversationId}`).emit('call_participant_joined', {
      callId,
      userId,
      userName: user.name,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error joining call:', error);
    res.status(500).json({ error: 'Failed to join call' });
  }
});

// End a call
router.post('/:id/end', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const io = req.app.get('io');
    const callId = req.params.id;
    const userId = req.user.userId;

    const call = await db.collection('calls').findOne({ _id: new ObjectId(callId) });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // If initiator ends call, end for everyone
    if (call.initiatorId === userId) {
      await db.collection('calls').updateOne(
        { _id: new ObjectId(callId) },
        {
          $set: {
            status: 'ended',
            endedAt: new Date().toISOString(),
          },
        }
      );

      io.to(`conversation:${call.conversationId}`).emit('call_ended', { callId });
    } else {
      // Otherwise just remove participant
      await db.collection('calls').updateOne(
        { _id: new ObjectId(callId) },
        {
          $pull: { participants: { userId } },
        }
      );

      io.to(`conversation:${call.conversationId}`).emit('call_participant_left', {
        callId,
        userId,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

// Send WebRTC signaling data
router.post('/:id/signal', authenticateToken, async (req, res) => {
  try {
    const io = req.app.get('io');
    const callId = req.params.id;
    const userId = req.user.userId;
    const { targetUserId, signal } = req.body;

    // Forward signaling data to target user
    io.to(`user:${targetUserId}`).emit('call_signal', {
      callId,
      fromUserId: userId,
      signal,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending signal:', error);
    res.status(500).json({ error: 'Failed to send signal' });
  }
});

export default router;
