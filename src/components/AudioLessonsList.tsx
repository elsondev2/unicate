import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Music, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface AudioLesson {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

export function AudioLessonsList({ readonly = false }: { readonly?: boolean }) {
  const [lessons, setLessons] = useState<AudioLesson[]>([]);

  useEffect(() => {
    fetchLessons();
    subscribeToLessons();
  }, []);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('audio_lessons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lessons:', error);
      return;
    }

    setLessons(data || []);
  };

  const subscribeToLessons = () => {
    const channel = supabase
      .channel('audio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_lessons',
        },
        () => {
          fetchLessons();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('audio_lessons').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete lesson');
      return;
    }

    toast.success('Lesson deleted');
  };

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
      {lessons.map((lesson) => (
        <Card key={lesson.id} className="p-4 transition-shadow hover:shadow-md">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{lesson.title}</h3>
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Added {new Date(lesson.created_at).toLocaleDateString()}
          </p>
          <audio controls className="mb-4 w-full">
            <source src={lesson.audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          {!readonly && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => deleteLesson(lesson.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
