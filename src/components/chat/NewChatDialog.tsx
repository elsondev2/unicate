import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import * as chatService from '@/lib/chatService';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  avatar_url?: string;
}

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'direct' | 'group';
  onSuccess: () => void;
}

export function NewChatDialog({ open, onClose, mode, onSuccess }: NewChatDialogProps) {
  const { user, userRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      let data: User[] = await response.json();
      
      // Filter based on role permissions
      if (userRole === 'STUDENT') {
        // Students can only chat with other students
        data = data.filter((u) => u.role === 'STUDENT' && u._id !== user?._id);
      } else {
        // Teachers can chat with anyone
        data = data.filter((u) => u._id !== user?._id);
      }
      
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (mode === 'group' && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      await chatService.createConversation(
        mode,
        selectedUsers,
        mode === 'group' ? groupName : undefined,
        mode === 'group' ? groupDescription : undefined
      );
      
      toast.success(mode === 'group' ? 'Group created' : 'Chat started');
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error('Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setGroupDescription('');
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'group' ? (
              <>
                <Users className="inline mr-2 h-5 w-5" />
                New Group
              </>
            ) : (
              <>
                <MessageSquare className="inline mr-2 h-5 w-5" />
                New Chat
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'group' 
              ? 'Create a new group conversation with multiple users'
              : 'Start a direct conversation with another user'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'group' && (
            <>
              <Input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] border rounded-lg">
            <div className="p-2 space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => toggleUserSelection(u._id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(u._id)}
                      onCheckedChange={() => toggleUserSelection(u._id)}
                    />
                    
                    <Avatar className="h-10 w-10">
                      {u.avatar_url ? (
                        <AvatarImage src={u.avatar_url} />
                      ) : null}
                      <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>

                    <Badge variant={u.role === 'TEACHER' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {selectedUsers.length} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
