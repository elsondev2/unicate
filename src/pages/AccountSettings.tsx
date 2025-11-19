import { useState } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, User, Lock, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';

export default function AccountSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${user._id}-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `${user._id}/${fileName}`;
      
      // Try Supabase first
      try {
        const { uploadFile: supabaseUpload, getPublicUrl } = await import('@/lib/supabase');
        await supabaseUpload('avatars', filePath, file);
        const avatarUrl = getPublicUrl('avatars', filePath);
        
        // Save URL to backend
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/avatar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: avatarUrl }),
        });

        if (!response.ok) {
          throw new Error('Failed to save avatar');
        }

        setProfileImage(avatarUrl);
        toast.success('Profile picture updated!');
      } catch (supabaseError) {
        // Fallback to base64 if Supabase fails
        console.warn('Supabase upload failed, using base64 fallback:', supabaseError);
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/avatar`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ avatar: base64String }),
          });

          if (!response.ok) {
            throw new Error('Failed to upload avatar');
          }

          setProfileImage(base64String);
          toast.success('Profile picture updated!');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    { path: '/settings/profile', label: 'Profile', icon: User },
    { path: '/settings/security', label: 'Security', icon: Lock },
    { path: '/settings/notifications', label: 'Notifications', icon: Bell },
    { path: '/settings/appearance', label: 'Appearance', icon: Palette },
  ];

  const currentPath = location.pathname;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Profile Card - Mobile Optimized */}
          <Card className="lg:sticky lg:top-24 h-fit">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-br from-primary to-accent text-white">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <CardTitle className="text-xl sm:text-2xl">{user?.name}</CardTitle>
              <CardDescription className="break-all">{user?.email}</CardDescription>
              <div className="mt-4">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {user?.role === 'TEACHER' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Settings Navigation & Content */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentPath === tab.path;
                return (
                  <Link key={tab.path} to={tab.path}>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      className={cn(
                        'w-full gap-2 py-6',
                        isActive && 'shadow-md'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Tab Content */}
            <Outlet />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
