import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, BookOpen, Music, Network } from 'lucide-react';
import { NotesList } from './NotesList';
import { AudioLessonsList } from './AudioLessonsList';
import { MindMapsList } from './MindMapsList';

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

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
              <p className="text-xs text-muted-foreground">Student Portal</p>
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
          <h2 className="text-3xl font-bold">Welcome, {profile?.name}!</h2>
          <p className="text-muted-foreground">Explore learning materials from your teachers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Learning Notes</CardTitle>
              </div>
              <CardDescription>Read and learn from teacher notes</CardDescription>
            </CardHeader>
            <CardContent>
              <NotesList readonly />
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                <CardTitle>Audio Lessons</CardTitle>
              </div>
              <CardDescription>Listen to audio lessons from teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <AudioLessonsList readonly />
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                <CardTitle>Mind Maps</CardTitle>
              </div>
              <CardDescription>Explore interactive mind maps</CardDescription>
            </CardHeader>
            <CardContent>
              <MindMapsList readonly />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
