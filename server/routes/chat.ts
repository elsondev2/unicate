import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../db.js';

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const userId = req.user.userId;

    const conversations = await db
      .collection('conversations')
      .find({
        'participants.userId': userId,
        isArchived: { $ne: true },
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Populate last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await db
          .collection('messages')
          .findOne(
            { conversationId: conv._id.toString() },
            { sort: { createdAt: -1 } }
          );

        return {
          ...conv,
          id: conv._id.toString(),
          lastMessage: lastMessage
            ? {
                ...lastMessage,
                id: lastMessage._id.toString(),
              }
            : null,
        };
      })
    );

    res.json(conversationsWithMessages);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create a new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { type, participantIds, name, description } = req.body;
    const userId = req.user.userId;

    // Validate participants
    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ error: 'At least one participant required' });
    }

    // Check if direct conversation already exists
    if (type === 'direct' && participantIds.length === 1) {
      const existingConv = await db.collection('conversations').findOne({
        type: 'direct',
        'participants.userId': { $all: [userId, participantIds[0]] },
      });

      if (existingConv) {
        return res.json({
          ...existingConv,
          id: existingConv._id.toString(),
        });
      }
    }

    // Get participant details
    const participantObjectIds = participantIds.map((id: string) => new ObjectId(id));
    const users = await db
      .collection('users')
      .find({ _id: { $in: participantObjectIds } })
      .toArray();

    // Add current user
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allUsers = [currentUser, ...users];
    const participants = allUsers.map((user) => ({
      userId: user._id.toString(),
      userName: user.name,
      userAvatar: user.avatar_url,
      userRole: user.role,
      joinedAt: new Date().toISOString(),
      isAdmin: user._id.toString() === userId,
    }));

    const conversation = {
      type,
      name: type === 'group' ? name : undefined,
      description: type === 'group' ? description : undefined,
      participants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      isArchived: false,
    };

    const result = await db.collection('conversations').insertOne(conversation);

    res.json({
      ...conversation,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const conversationId = req.params.id;
    const userId = req.user.userId;

    // Verify user is participant
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      'participants.userId': userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await db
      .collection('messages')
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    const messagesWithIds = messages.map((msg) => ({
      ...msg,
      id: msg._id.toString(),
    }));

    res.json(messagesWithIds);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const io = req.app.get('io');
    const conversationId = req.params.id;
    const userId = req.user.userId;
    const { content, type = 'text', fileUrl, fileName, replyTo } = req.body;

    // Verify user is participant
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      'participants.userId': userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get sender info
    const sender = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!sender) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = {
      conversationId,
      senderId: userId,
      senderName: sender.name,
      senderAvatar: sender.avatar_url,
      content,
      type,
      fileUrl,
      fileName,
      replyTo,
      createdAt: new Date().toISOString(),
      readBy: [userId],
    };

    const result = await db.collection('messages').insertOne(message);

    // Update conversation's updatedAt
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { updatedAt: new Date().toISOString() } }
    );

    const messageWithId = {
      ...message,
      id: result.insertedId.toString(),
    };

    // Emit message to conversation room
    io.to(`conversation:${conversationId}`).emit('new_message', messageWithId);

    res.json(messageWithId);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.post('/conversations/:id/read', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const conversationId = req.params.id;
    const userId = req.user.userId;

    // Update participant's lastReadAt
    await db.collection('conversations').updateOne(
      {
        _id: new ObjectId(conversationId),
        'participants.userId': userId,
      },
      {
        $set: {
          'participants.$.lastReadAt': new Date().toISOString(),
        },
      }
    );

    // Mark all messages as read
    await db.collection('messages').updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Add participants to group
router.post('/conversations/:id/participants', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const conversationId = req.params.id;
    const userId = req.user.userId;
    const { participantIds } = req.body;

    // Verify user is admin
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      type: 'group',
      'participants': {
        $elemMatch: { userId, isAdmin: true },
      },
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get new participant details
    const participantObjectIds = participantIds.map((id: string) => new ObjectId(id));
    const users = await db
      .collection('users')
      .find({ _id: { $in: participantObjectIds } })
      .toArray();

    const newParticipants = users.map((user) => ({
      userId: user._id.toString(),
      userName: user.name,
      userAvatar: user.avatar_url,
      userRole: user.role,
      joinedAt: new Date().toISOString(),
      isAdmin: false,
    }));

    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $push: { participants: { $each: newParticipants } },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ error: 'Failed to add participants' });
  }
});

// Remove participant from group
router.delete('/conversations/:id/participants/:participantId', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const conversationId = req.params.id;
    const participantId = req.params.participantId;
    const userId = req.user.userId;

    // Verify user is admin or removing themselves
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      type: 'group',
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isAdmin = conversation.participants.some(
      (p: any) => p.userId === userId && p.isAdmin
    );
    const isSelf = participantId === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $pull: { participants: { userId: participantId } },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

export default router;
