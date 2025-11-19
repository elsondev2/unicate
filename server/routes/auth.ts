import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db.js';
import { ObjectId } from 'mongodb';
import { config } from '../config.js';

const router = express.Router();
const JWT_SECRET = config.jwtSecret;

router.post('/signup', async (req, res) => {
  try {
    console.log('Signup attempt for:', req.body.email);
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      console.error('Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('Connecting to database...');
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    console.log('Checking for existing user...');
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating user...');
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      role,
      avatar_url: '',
      createdAt: new Date(),
    });

    console.log('User created with ID:', result.insertedId);
    const user = await usersCollection.findOne({ _id: result.insertedId });
    if (!user) {
      console.error('Failed to retrieve created user');
      return res.status(500).json({ error: 'Failed to create user' });
    }

    console.log('Generating token...');
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log('Signup successful for:', email);
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Signup error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to sign up', details: errorMessage });
  }
});

router.post('/signin', async (req, res) => {
  try {
    console.log('Signin attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      console.error('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log('Signin successful for:', email);
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Signin error details:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to sign in', details: errorMessage });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: 'TEACHER' | 'STUDENT';
    };

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

router.put('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: 'TEACHER' | 'STUDENT';
    };

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await usersCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: 'TEACHER' | 'STUDENT';
    };

    const { name, avatar_url } = req.body;

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const updateData: unknown = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    await usersCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: updateData }
    );

    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
