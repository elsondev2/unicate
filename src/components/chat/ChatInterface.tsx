import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, Phone, Video, MoreVertical, Paperclip, 
  Image as ImageIcon, Smile, ArrowLeft, Users 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Message, Conversation } from '@/types/chat';
import * as chatService from '@/lib/chatService';
import { MessageBubble } from './MessageBubble';
import { CallDialog } from '@/components/chat/CallDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  conversation: Conversation;
  onBack: () => void;
  onViewParticipants?: () => void;
}

export function ChatInterface({ conversation, onBack, onViewParticipants }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatService.fetchMessages(conversation.id);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversation.id, scrollToBottom]);

  const markAsRead = useCallback(async () => {
    try {
      await chatService.markMessagesAsRead(conversation.id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [conversation.id]);

  useEffect(() => {
    loadMessages();
    markAsRead();

    // Subscribe to new messages
    const unsubscribe = chatService.subscribeToMessages(conversation.id, (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      if (message.senderId !== user?._id) {
        markAsRead();
      }
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = chatService.subscribeToTyping(
      conversation.id,
      (userId, userName, isTyping) => {
        if (userId !== user?._id) {
          setTypingUsers((prev) => {
            if (isTyping) {
              return prev.includes(userName) ? prev : [...prev, userName];
            } else {
              return prev.filter((name) => name !== userName);
            }
          });
        }
      }
    );

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [conversation.id, loadMessages, markAsRead, scrollToBottom, user?._id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await chatService.sendMessage(conversation.id, newMessage.trim());
      setNewMessage('');
      handleTyping(false);
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      setIsTyping(true);
      chatService.sendTypingIndicator(conversation.id, user?.name || '', true);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        chatService.sendTypingIndicator(conversation.id, user?.name || '', false);
      }, 3000);
    } else {
      setIsTyping(false);
      chatService.sendTypingIndicator(conversation.id, user?.name || '', false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const url = await chatService.uploadChatFile(file);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      await chatService.sendMessage(
        conversation.id,
        file.name,
        type,
        url,
        file.name
      );
      toast.success('File sent');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setShowCallDialog(true);
  };

  const handleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      chatService.sendTypingIndicator(conversation.id, user?.name || '', true);
      
      // Simulate recording for 2 seconds (in real app, you'd use MediaRecorder API)
      setTimeout(async () => {
        try {
          await chatService.sendMessage(
            conversation.id,
            '🎤 Voice message',
            'text'
          );
          toast.success('Voice message sent');
        } catch (error) {
          toast.error('Failed to send voice message');
        } finally {
          setIsRecording(false);
          chatService.sendTypingIndicator(conversation.id, user?.name || '', false);
        }
      }, 2000);
    }
  };

  const getConversationTitle = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?._id
    );
    return otherParticipant?.userName || 'Chat';
  };

  const getConversationAvatar = () => {
    if (conversation.type === 'group') {
      return conversation.avatar;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?._id
    );
    return otherParticipant?.userAvatar;
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#00a884] text-white p-4 flex items-center gap-3 shadow-md">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="md:hidden text-white hover:bg-[#00a884]/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            {getConversationAvatar() ? (
              <AvatarImage src={getConversationAvatar()} />
            ) : null}
            <AvatarFallback className="bg-[#00a884] text-white font-semibold">
              {conversation.type === 'group' ? (
                <Users className="h-5 w-5" />
              ) : (
                getConversationTitle().slice(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{getConversationTitle()}</h3>
            {isRecording ? (
              <p className="text-xs text-green-100 flex items-center gap-1">
                <span className="animate-pulse">🎤</span> recording...
              </p>
            ) : typingUsers.length > 0 ? (
              <p className="text-xs text-green-100">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </p>
            ) : conversation.type === 'group' ? (
              <p className="text-xs text-green-100">
                {conversation.participants.length} participants
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => startCall('audio')}
              className="text-white hover:bg-[#00a884]/80"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => startCall('video')}
              className="text-white hover:bg-[#00a884]/80"
            >
              <Video className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-[#00a884]/80">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {conversation.type === 'group' && (
                  <DropdownMenuItem onClick={onViewParticipants}>
                    <Users className="mr-2 h-4 w-4" />
                    View Participants
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>Archive Chat</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Leave Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M0 0L50 50M50 0L100 50M0 50L50 100M50 50L100 100\' stroke=\'%23d1c7b7\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")'
        }}>
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?._id}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-gray-100 p-4 flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="text-gray-600 hover:text-gray-900"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Input
            placeholder={isRecording ? "Recording..." : "Type a message"}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isRecording}
            className="flex-1 rounded-full bg-white border-gray-300 focus:border-[#00a884] focus:ring-[#00a884] disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {newMessage.trim() ? (
            <Button
              onClick={handleSendMessage}
              disabled={sending}
              size="icon"
              className="rounded-full bg-[#00a884] hover:bg-[#00a884]/90 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleRecording}
              disabled={isRecording}
              size="icon"
              className={`rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#00a884] text-white hover:bg-[#00a884]/90'
              }`}
              title="Record voice message"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {showCallDialog && (
        <CallDialog
          conversation={conversation}
          callType={callType}
          onClose={() => setShowCallDialog(false)}
        />
      )}
    </>
  );
}
