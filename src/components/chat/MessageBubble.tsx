import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { File, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
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
      case 'voice':
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
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${isOwn ? 'max-w-[70%]' : 'max-w-[70%]'}`}>
        <div
          className={`px-4 py-2 rounded-lg shadow ${
            isOwn
              ? 'bg-[#d9fdd3] text-gray-900 rounded-br-none'
              : 'bg-white text-gray-900 rounded-bl-none'
          }`}
        >
          {!isOwn && message.senderName && (
            <p className="text-xs font-semibold text-[#00a884] mb-1">
              {message.senderName}
            </p>
          )}
          {renderContent()}
          <div className={`text-xs mt-1 text-right ${isOwn ? 'text-gray-600' : 'text-gray-500'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
