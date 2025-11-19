import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
}

export function NotesList({ readonly = false }: { readonly?: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
    subscribeToNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    setNotes(data || []);
  };

  const subscribeToNotes = () => {
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete note');
      return;
    }

    toast.success('Note deleted');
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No notes available yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <Card key={note.id} className="p-4 transition-shadow hover:shadow-md">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{note.title}</h3>
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Updated {new Date(note.updated_at).toLocaleDateString()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              {readonly ? <Eye className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {readonly ? 'View' : 'Edit'}
            </Button>
            {!readonly && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteNote(note.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
