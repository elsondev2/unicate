import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Music, Trash2, Play, Pause, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AudioLesson {
  _id: string;
  title: string;
  description?: string;
  audioUrl: string;
  coverArt?: string;
  user_id: string;
  user_name?: string;
  created_at: string;
  mimeType?: string;
}

export function AudioLessonsList({ readonly = false }: { readonly?: boolean }) {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<AudioLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAudioLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAudioLessons = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/audio`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio lessons');
      }

      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error fetching audio lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/audio/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete audio');
      }

      toast.success('Audio deleted');
      fetchAudioLessons();
    } catch (error) {
      toast.error('Failed to delete audio');
    }
  };

  const handlePreview = (lesson: AudioLesson, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (previewingId === lesson._id) {
      // Stop preview
      audioElement?.pause();
      setPreviewingId(null);
      setAudioElement(null);
    } else {
      // Stop any existing preview
      audioElement?.pause();
      
      // Start new preview
      const audio = new Audio(lesson.audioUrl);
      audio.play();
      setAudioElement(audio);
      setPreviewingId(lesson._id);
      
      audio.onended = () => {
        setPreviewingId(null);
        setAudioElement(null);
      };
    }
  };

  const handleCardClick = (lessonId: string) => {
    // Stop any preview
    audioElement?.pause();
    setPreviewingId(null);
    setAudioElement(null);
    
    // Navigate to player with this audio
    navigate('/audio/player', { state: { audioId: lessonId } });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading audio lessons...</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Music className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No audio lessons available yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => {
        const isOwner = user && lesson.user_id === user._id.toString();
        const canDelete = !readonly && isOwner;
        const isPreviewing = previewingId === lesson._id;
        
        return (
          <Card 
            key={lesson._id} 
            className="p-4 transition-all hover:shadow-lg cursor-pointer group"
            onClick={() => handleCardClick(lesson._id)}
          >
            {/* Cover Art */}
            {lesson.coverArt ? (
              <div className="aspect-square w-full mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                <img 
                  src={lesson.coverArt} 
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ) : (
              <div className="aspect-square w-full mb-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Music className="h-16 w-16 text-primary/50" />
              </div>
            )}

            <div className="mb-3">
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{lesson.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {lesson.user_name && <span className="text-primary font-medium">By: {lesson.user_name} • </span>}
                {new Date(lesson.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => handlePreview(lesson, e)}
              >
                {isPreviewing ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Preview
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => handleDelete(lesson._id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
