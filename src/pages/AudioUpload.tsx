import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function AudioUpload() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!title.trim() || !file) {
      toast.error('Please provide title and audio file');
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      const { error } = await supabase.from('audio_lessons').insert({
        title,
        audio_url: publicUrl,
        teacher_id: user?.id,
      });

      if (error) throw error;

      toast.success('Audio uploaded!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl">
        <Button variant="outline" className="mb-6" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Upload Audio Lesson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title..."
              />
            </div>
            <div>
              <Label htmlFor="file">Audio File</Label>
              <Input
                id="file"
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
