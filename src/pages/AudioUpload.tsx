import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Upload, Music, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile, getPublicUrl } from '@/lib/supabase';

export default function AudioUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setCoverArt(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setUploading(true);

    try {
      // Upload audio to Supabase
      const audioFileName = `${user._id}-${Date.now()}-${audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const audioPath = `${user._id}/${audioFileName}`;
      
      console.log('Uploading audio to Supabase:', audioPath);
      await uploadFile('audio-lessons', audioPath, audioFile);
      const audioUrl = getPublicUrl('audio-lessons', audioPath);
      
      // Upload cover art if provided
      let coverArtUrl = '';
      if (coverArt) {
        const coverFileName = `${user._id}-${Date.now()}-cover.${coverArt.name.split('.').pop()}`;
        const coverPath = `${user._id}/${coverFileName}`;
        
        console.log('Uploading cover art to Supabase:', coverPath);
        await uploadFile('audio-lessons', coverPath, coverArt);
        coverArtUrl = getPublicUrl('audio-lessons', coverPath);
      }

      // Save metadata to backend
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          audioUrl,
          coverArt: coverArtUrl,
          fileName: audioFile.name,
          fileSize: audioFile.size,
          mimeType: audioFile.type,
          duration: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save audio metadata');
      }

      toast.success('Audio uploaded successfully!');
      navigate('/audio/player');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload audio';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Upload Audio Lesson</h1>
            <p className="text-sm text-muted-foreground">Share audio content with students</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Audio Details
            </CardTitle>
            <CardDescription>
              Upload an audio file and provide details about the lesson
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to Calculus"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this audio lesson covers..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio">Audio File *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required
                  />
                  {audioFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Music className="h-4 w-4" />
                      {audioFile.name}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP3, WAV, OGG, M4A (Max 50MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverArt">Cover Art (Optional)</Label>
                <Input
                  id="coverArt"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverArtChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image (e.g., 500x500px). Max 5MB
                </p>
              </div>

              {coverPreview && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Cover Art Preview</h4>
                  <img 
                    src={coverPreview} 
                    alt="Cover preview" 
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                </div>
              )}

              {audioFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Audio Preview</h4>
                  <audio controls className="w-full">
                    <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading} className="flex-1">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Audio
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
