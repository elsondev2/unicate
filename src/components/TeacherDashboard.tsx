import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, BookOpen, Music, Network, Plus } from 'lucide-react';
import { NotesList } from './NotesList';
import { AudioLessonsList } from './AudioLessonsList';
import { MindMapsList } from './MindMapsList';
import { useNavigate } from 'react-router-dom';

export function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    setProfile(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">LearnHub</h1>
              <p className="text-xs text-muted-foreground">Teacher Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.name}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Welcome back, {profile?.name}!</h2>
          <p className="text-muted-foreground">Manage your notes, audio lessons, and mind maps</p>
        </div>

        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="notes" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-2">
              <Music className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="mindmaps" className="gap-2">
              <Network className="h-4 w-4" />
              Mind Maps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Notes</CardTitle>
                    <CardDescription>Create and manage learning notes with rich text</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/notes/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <NotesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Audio Lessons</CardTitle>
                    <CardDescription>Upload and share audio lessons with students</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/audio/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Audio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AudioLessonsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mindmaps" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mind Maps</CardTitle>
                    <CardDescription>Create interactive mind maps for visual learning</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/mindmaps/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Mind Map
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MindMapsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
