import { socketService } from './socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'TEACHER' | 'STUDENT';
  avatar_url?: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMap {
  _id: string;
  title: string;
  nodes: any[];
  edges: any[];
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioLesson {
  _id: string;
  title: string;
  description: string;
  audioUrl: string;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    console.log(`API Request: ${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    
    console.log(`API Response: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.error || data.details || 'Request failed');
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout');
        throw new Error('Request timeout - server may be slow or unavailable');
      }
      console.error('Fetch error:', error.message);
      throw error;
    }
    throw new Error('Network error');
  }
}

// Initialize Socket.io connection
export function initializeSocket() {
  socketService.connect();
}

// Disconnect Socket.io
export function disconnectSocket() {
  socketService.disconnect();
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: 'TEACHER' | 'STUDENT'
): Promise<AuthResponse> {
  return fetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return fetchAPI('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const data = await fetchAPI('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.user;
  } catch (error) {
    return null;
  }
}

// Notes API
export async function getNotes(search?: string, myNotesOnly?: boolean): Promise<Note[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (myNotesOnly) params.append('myNotes', 'true');
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/notes${query}`);
}

export async function createNote(title: string, content: string): Promise<Note> {
  return fetchAPI('/notes', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });
}

export async function updateNote(id: string, title: string, content: string): Promise<Note> {
  return fetchAPI(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content }),
  });
}

export async function deleteNote(id: string): Promise<void> {
  return fetchAPI(`/notes/${id}`, {
    method: 'DELETE',
  });
}

// MindMaps API
export async function getMindMaps(search?: string, myMapsOnly?: boolean): Promise<MindMap[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (myMapsOnly) params.append('myMaps', 'true');
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/mindmaps${query}`);
}

export async function createMindMap(title: string, nodes: any[], edges: any[]): Promise<MindMap> {
  return fetchAPI('/mindmaps', {
    method: 'POST',
    body: JSON.stringify({ title, nodes, edges }),
  });
}

export async function updateMindMap(id: string, title: string, nodes: any[], edges: any[]): Promise<MindMap> {
  return fetchAPI(`/mindmaps/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, nodes, edges }),
  });
}

export async function deleteMindMap(id: string): Promise<void> {
  return fetchAPI(`/mindmaps/${id}`, {
    method: 'DELETE',
  });
}

// Audio Lessons API
export async function getAudioLessons(search?: string, myAudioOnly?: boolean): Promise<AudioLesson[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (myAudioOnly) params.append('myAudio', 'true');
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI(`/audio${query}`);
}

export async function uploadAudio(formData: FormData): Promise<AudioLesson> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_URL}/audio`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload audio');
  }

  return data;
}

export async function deleteAudio(id: string): Promise<void> {
  return fetchAPI(`/audio/${id}`, {
    method: 'DELETE',
  });
}

// User Profile API
export async function updateProfile(name?: string, avatar_url?: string): Promise<{ user: User }> {
  return fetchAPI('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, avatar_url }),
  });
}

// Socket.io event listeners
export function onNoteCreated(callback: (note: Note) => void) {
  socketService.on('note:created', callback);
}

export function onNoteUpdated(callback: (note: Note) => void) {
  socketService.on('note:updated', callback);
}

export function onNoteDeleted(callback: (noteId: string) => void) {
  socketService.on('note:deleted', callback);
}

export function onMindMapCreated(callback: (mindMap: MindMap) => void) {
  socketService.on('mindmap:created', callback);
}

export function onMindMapUpdated(callback: (mindMap: MindMap) => void) {
  socketService.on('mindmap:updated', callback);
}

export function onMindMapDeleted(callback: (mindMapId: string) => void) {
  socketService.on('mindmap:deleted', callback);
}

export function onAudioCreated(callback: (audio: AudioLesson) => void) {
  socketService.on('audio:created', callback);
}

export function onAudioDeleted(callback: (audioId: string) => void) {
  socketService.on('audio:deleted', callback);
}
