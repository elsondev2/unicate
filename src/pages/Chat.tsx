import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { Conversation } from '@/types/chat';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [chatMode, setChatMode] = useState<'direct' | 'group'>('direct');

  const handleNewChat = () => {
    setChatMode('direct');
    setShowNewChatDialog(true);
  };

  const handleNewGroup = () => {
    setChatMode('group');
    setShowNewChatDialog(true);
  };

  const handleChatCreated = () => {
    setShowNewChatDialog(false);
    // Refresh conversation list
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Conversation List */}
          <div className={`${selectedConversation ? 'hidden md:block' : ''}`}>
            <Card className="h-full flex flex-col overflow-hidden">
              <ConversationList
                onSelectConversation={setSelectedConversation}
                onNewChat={handleNewChat}
                onNewGroup={handleNewGroup}
              />
            </Card>
          </div>

          {/* Chat Interface */}
          <div className={`md:col-span-2 ${!selectedConversation ? 'hidden md:flex' : ''}`}>
            {selectedConversation ? (
              <Card className="h-full flex flex-col overflow-hidden">
                <ChatInterface
                  conversation={selectedConversation}
                  onBack={() => setSelectedConversation(null)}
                />
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <MessageSquare className="w-24 h-24 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-xl font-semibold mb-2">Select a chat to start messaging</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        mode={chatMode}
        onSuccess={handleChatCreated}
      />
    </DashboardLayout>
  );
}
