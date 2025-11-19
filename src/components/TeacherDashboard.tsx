import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Music, Network, Plus, Sparkles } from 'lucide-react';
import { NotesList } from './NotesList';
import { AudioLessonsList } from './AudioLessonsList';
import { MindMapsList } from './MindMapsList';
import { DashboardLayout } from './DashboardLayout';
import { useNavigate } from 'react-router-dom';

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome back, {user?.name}! 🎓
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Manage your notes, audio lessons, and mind maps</p>
        </div>

        <Tabs defaultValue="notes" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-11 sm:h-12 bg-muted/50">
            <TabsTrigger value="notes" className="flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="hidden xs:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm">
              <Music className="h-4 w-4" />
              <span className="hidden xs:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="mindmaps" className="flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm">
              <Network className="h-4 w-4" />
              <span className="hidden xs:inline">Maps</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Your Notes</CardTitle>
                      <CardDescription>Create and manage learning notes with rich text</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/notes/new')} size="lg" className="shadow-md">
                    <Plus className="mr-2 h-5 w-5" />
                    New Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <NotesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <Card className="border-accent/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Audio Lessons</CardTitle>
                      <CardDescription>Upload and share audio lessons with students</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/audio/upload')} size="lg" className="shadow-md">
                    <Plus className="mr-2 h-5 w-5" />
                    Upload Audio
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AudioLessonsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mindmaps" className="space-y-4">
            <Card className="border-secondary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Network className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Mind Maps</CardTitle>
                      <CardDescription>Create interactive mind maps for visual learning</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/mindmaps/new')} size="lg" className="shadow-md">
                    <Plus className="mr-2 h-5 w-5" />
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
      </div>
    </DashboardLayout>
  );
}
