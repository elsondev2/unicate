import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users as UsersIcon, GraduationCap, BookOpen, Loader2, User as UserIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  avatar_url?: string;
  bio?: string;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const teachers = users.filter((u) => u.role === 'TEACHER');
  const students = users.filter((u) => u.role === 'STUDENT');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {user.bio && (
              <p className="text-xs text-muted-foreground truncate mt-1">{user.bio}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUser(user)}
            >
              <UserIcon className="h-4 w-4 mr-1" />
              View
            </Button>
            <Badge variant={user.role === 'TEACHER' ? 'default' : 'secondary'}>
              {user.role === 'TEACHER' ? (
                <BookOpen className="mr-1 h-3 w-3" />
              ) : (
                <GraduationCap className="mr-1 h-3 w-3" />
              )}
              {user.role}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* User Bio Modal */}
      {selectedUser && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-card border rounded-lg shadow-2xl w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Profile</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedUser(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="h-24 w-24">
                    {selectedUser.avatar_url ? (
                      <AvatarImage src={selectedUser.avatar_url} alt={selectedUser.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Badge variant={selectedUser.role === 'TEACHER' ? 'default' : 'secondary'} className="text-sm">
                    {selectedUser.role === 'TEACHER' ? (
                      <BookOpen className="mr-1 h-4 w-4" />
                    ) : (
                      <GraduationCap className="mr-1 h-4 w-4" />
                    )}
                    {selectedUser.role}
                  </Badge>
                </div>

                {/* Bio */}
                {selectedUser.bio ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Bio</h4>
                    <p className="text-sm">{selectedUser.bio}</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground italic">No bio available</p>
                  </div>
                )}

                {/* Member Since */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Member since {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Connect with teachers and students in the platform
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">
              <UsersIcon className="mr-2 h-4 w-4" />
              All ({users.length})
            </TabsTrigger>
            <TabsTrigger value="teachers">
              <BookOpen className="mr-2 h-4 w-4" />
              Teachers ({teachers.length})
            </TabsTrigger>
            <TabsTrigger value="students">
              <GraduationCap className="mr-2 h-4 w-4" />
              Students ({students.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Browse all teachers and students on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teachers</CardTitle>
                <CardDescription>
                  Connect with teachers creating content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {teachers.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  Connect with fellow learners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((user) => (
                  <UserCard key={user._id} user={user} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
