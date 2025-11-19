import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Music, Network, Sparkles } from 'lucide-react';
import { NotesList } from './NotesList';
import { AudioLessonsList } from './AudioLessonsList';
import { MindMapsList } from './MindMapsList';
import { DashboardLayout } from './DashboardLayout';

export function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Explore learning materials from your teachers</p>
        </div>

        <div className="grid gap-6">
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">Learning Notes</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Read and learn from teacher notes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <NotesList readonly />
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Audio Lessons</CardTitle>
                  <CardDescription>Listen to audio lessons from teachers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <AudioLessonsList readonly />
            </CardContent>
          </Card>

          <Card className="border-secondary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Network className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Mind Maps</CardTitle>
                  <CardDescription>Explore interactive mind maps</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <MindMapsList readonly />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
