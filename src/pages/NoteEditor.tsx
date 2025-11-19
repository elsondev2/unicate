import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Placeholder.configure({ placeholder: 'Start writing your note...' }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] max-w-none',
      },
    },
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return;

    setTitle(data.title);
    if (data.content) {
      editor?.commands.setContent(data.content as any);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);

    try {
      const content = editor?.getJSON();

      if (id === 'new') {
        const { error } = await supabase.from('notes').insert({
          title,
          content,
          teacher_id: user?.id,
        });

        if (error) throw error;
        toast.success('Note created!');
      } else {
        const { error } = await supabase
          .from('notes')
          .update({ title, content })
          .eq('id', id);

        if (error) throw error;
        toast.success('Note saved!');
      }

      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const readonly = userRole === 'STUDENT';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {!readonly && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>

        <Card className="p-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="mb-4 text-2xl font-bold"
            disabled={readonly}
          />
          <EditorContent editor={editor} />
        </Card>
      </div>
    </div>
  );
}
