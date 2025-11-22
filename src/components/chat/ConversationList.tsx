import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Conversation } from '@/types/chat';
import * as chatService from '@/lib/chatService';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
}

export function ConversationList({
  onSelectConversation,
  onNewChat,
  onNewGroup,
}: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const getConversationName = useCallback((conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?._id
    );
    return otherParticipant?.userName || 'Chat';
  }, [user?._id]);

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.avatar;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?._id
    );
    return otherParticipant?.userAvatar;
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 0;
    const participant = conversation.participants.find((p) => p.userId === user?._id);
    if (!participant?.lastReadAt) return 1;
    
    const lastReadTime = new Date(participant.lastReadAt).getTime();
    const lastMessageTime = new Date(conversation.lastMessage.createdAt).getTime();
    
    return lastMessageTime > lastReadTime ? 1 : 0;
  };

  const loadConversations = async () => {
    try {
      const data = await chatService.fetchConversations();
      setConversations(data);
      setFilteredConversations(data);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter((conv) => {
        const name = getConversationName(conv).toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations, getConversationName]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold">Messages</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onNewChat}
            title="New Chat"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNewGroup}
            title="New Group"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>{searchQuery ? 'No conversations found' : 'No chats yet'}</p>
            <p className="text-sm mt-2">Click + to start a new conversation</p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors border-b text-left"
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    {getConversationAvatar(conversation) ? (
                      <AvatarImage src={getConversationAvatar(conversation)} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                      {conversation.type === 'group' ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        getConversationName(conversation).slice(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold truncate">
                        {getConversationName(conversation)}
                      </h4>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessage.createdAt),
                            { addSuffix: false }
                          )}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <Badge className="ml-2">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
