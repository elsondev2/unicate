import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { File, Download, MoreVertical, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, isOwn, onEdit, onDelete }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Image'}
              className="max-w-sm rounded-lg"
            />
            {message.content && <p>{message.content}</p>}
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{message.content}</span>
          </div>
        );
      
      case 'file':
        return (
          <div className={`flex items-center gap-3 p-3 rounded-lg ${isOwn ? 'bg-[#005c4b]' : 'bg-gray-100'}`}>
            <File className={`h-8 w-8 ${isOwn ? 'text-green-100' : 'text-gray-600'}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{message.fileName}</p>
              <p className={`text-xs ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>{message.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(message.fileUrl, '_blank')}
              className={isOwn ? 'text-white hover:bg-[#005c4b]' : 'text-gray-600 hover:bg-gray-200'}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      
      default:
        return <p className="break-words">{message.content}</p>;
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`mb-3 flex group ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md px-4 py-2 rounded-lg shadow relative ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted rounded-bl-none'
        }`}
      >
        {/* Edit/Delete Menu (only for own messages) */}
        {isOwn && !isEditing && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete && onDelete(message.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {!isOwn && message.senderName && (
          <p className="text-xs font-semibold text-primary mb-1">
            {message.senderName}
          </p>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {renderContent()}
            <div className={`text-xs mt-1 ${isOwn ? 'opacity-70' : 'text-muted-foreground'}`}>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
