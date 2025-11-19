import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { EditorToolbar } from '@/components/EditorToolbar';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import * as services from '@/lib/services';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [noteOwnerId, setNoteOwnerId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({ 
        placeholder: 'Start writing your note... Use the toolbar above to format your text.',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none min-h-[500px] max-w-none p-6',
      },
    },
    editable: true, // Will be updated based on ownership
  });

  useEffect(() => {
    if (id && id !== 'new' && user) {
      fetchNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchNote = async () => {
    if (!user || !id) return;
    
    try {
      const data = await services.getNote(id, user._id.toString());
      if (!data) return;

      setTitle(data.title);
      setNoteOwnerId(data.user_id);
      
      // Set editor to read-only if user is not the owner
      const isOwner = data.user_id === user._id.toString();
      editor?.setEditable(isOwner);
      
      if (data.content) {
        // Parse the content if it's a string
        let parsedContent = data.content;
        if (typeof data.content === 'string') {
          try {
            parsedContent = JSON.parse(data.content);
          } catch (e) {
            console.error('Error parsing content:', e);
          }
        }
        editor?.commands.setContent(parsedContent as Record<string, unknown>);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to load note');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);

    try {
      const content = editor?.getJSON() || {};

      if (id === 'new') {
        await services.createNote(user._id.toString(), title, content);
        toast.success('Note created!');
      } else {
        await services.updateNote(id!, user._id.toString(), title, content);
        toast.success('Note saved!');
      }

      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const isOwner = user && noteOwnerId === user._id.toString();
  const readonly = id !== 'new' && !isOwner;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')} size="sm" className="sm:size-default">
            <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Back to Dashboard</span>
            <span className="xs:hidden">Back</span>
          </Button>
          {!readonly && (
            <Button onClick={handleSave} disabled={saving} size="sm" className="sm:size-default shadow-md">
              <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{saving ? 'Saving...' : 'Save Note'}</span>
              <span className="xs:hidden">Save</span>
            </Button>
          )}
          {readonly && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
              View Only
            </div>
          )}
        </div>

        <Card className="shadow-xl border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 sm:p-6 border-b">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="text-xl sm:text-2xl md:text-3xl font-bold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              disabled={readonly}
            />
          </div>
          
          {!readonly && <EditorToolbar editor={editor} />}
          
          <div className="bg-card">
            <EditorContent editor={editor} />
          </div>
        </Card>

        {readonly && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            📖 You are viewing this note in read-only mode
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
