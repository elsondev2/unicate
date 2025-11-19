import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import mindMapsRoutes from './routes/mindmaps.js';
import audioRoutes from './routes/audio.js';
import usersRoutes from './routes/users.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

const PORT = config.port;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for audio files
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/mindmaps', mindMapsRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Socket.io enabled for real-time updates');
});

// Export io for use in routes
export { io };
