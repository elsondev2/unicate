import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as services from '@/lib/services';

interface Note {
  _id: string;
  title: string;
  content: unknown;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function NotesList({ readonly = false }: { readonly?: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await services.getNotes(user._id.toString());
      setNotes(data as unknown as Note[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    
    try {
      await services.deleteNote(id, user._id.toString());
      toast.success('Note deleted');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No notes available yet</p>
      </div>
    );
  }

  const getContentPreview = (content: unknown): string => {
    try {
      if (typeof content === 'string') {
        const parsed = JSON.parse(content);
        if (parsed?.content && Array.isArray(parsed.content)) {
          const textContent = parsed.content
            .map((node: { type?: string; content?: Array<{ text?: string }> }) => {
              if (node.type === 'paragraph' && node.content) {
                return node.content.map((c) => c.text || '').join('');
              }
              return '';
            })
            .join(' ');
          return textContent.slice(0, 100) + (textContent.length > 100 ? '...' : '');
        }
      }
      return 'No content';
    } catch {
      return 'No content';
    }
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => {
        const isOwner = user && note.user_id === user._id.toString();
        const canEdit = !readonly && isOwner;
        
        return (
          <Card key={note._id} className="p-4 sm:p-5 transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer group" onClick={() => navigate(`/notes/${note._id}`)}>
            <div className="mb-3 flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1 truncate group-hover:text-primary transition-colors">
                  {note.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {!isOwner && <span className="text-primary font-medium">By: {(note as any).user_name || 'Unknown'} • </span>}
                  Updated {new Date(note.updated_at).toLocaleDateString()}
                  {!isOwner && <span className="ml-2 text-primary">• Shared</span>}
                </p>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3">
              {getContentPreview(note.content)}
            </p>
            
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => navigate(`/notes/${note._id}`)}
              >
                {canEdit ? <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="hidden xs:inline">{canEdit ? 'Edit' : 'View'}</span>
              </Button>
              {canEdit && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteNote(note._id)}
                  className="px-2 sm:px-3"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
