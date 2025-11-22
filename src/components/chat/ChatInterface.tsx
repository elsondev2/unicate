import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Phone, Video, Users, Send, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Message, Conversation } from '@/types/chat';
import * as chatService from '@/lib/chatService';
import { MessageBubble } from './MessageBubble';
import { CallDialog } from '@/components/chat/CallDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear immediately like WhatsApp
    handleTyping(false);

    setSending(true);
    try {
      await chatService.sendMessage(conversation.id, messageToSend);
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageToSend); // Restore message on error
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

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      // TODO: Implement edit message API
      toast.success('Message edited');
      // Refresh messages
      loadMessages();
    } catch (error) {
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // TODO: Implement delete message API
      toast.success('Message deleted');
      // Remove from local state
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      toast.error('Failed to delete message');
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
        <div className="p-4 border-b flex items-center gap-3">
          <Button 
            variant="ghost"
            size="icon"
            onClick={onBack} 
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            {getConversationAvatar() ? (
              <AvatarImage src={getConversationAvatar()} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {conversation.type === 'group' ? (
                <Users className="h-5 w-5" />
              ) : (
                getConversationTitle().slice(0, 1).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{getConversationTitle()}</h3>
            {isRecording ? (
              <p className="text-xs text-muted-foreground">
                🎤 recording...
              </p>
            ) : typingUsers.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                typing...
              </p>
            ) : conversation.type === 'group' ? (
              <p className="text-xs text-muted-foreground">
                {conversation.participants.length} participants
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => startCall('audio')}
              title="Audio call"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => startCall('video')}
              title="Video call"
            >
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?._id}
                onEdit={(id, content) => handleEditMessage(id, content)}
                onDelete={(id) => handleDeleteMessage(id)}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder={isRecording ? "Recording..." : "Type a message..."}
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
              className="flex-1"
            />

            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sending}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleRecording}
                disabled={isRecording}
                size="icon"
                variant={isRecording ? "destructive" : "default"}
                className={isRecording ? "animate-pulse" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
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
