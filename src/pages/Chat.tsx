import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { Conversation } from '@/types/chat';
import { MessageSquare } from 'lucide-react';

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
    window.dispatchEvent(new CustomEvent('refresh-conversations'));
  };

  return (
    <DashboardLayout>
      <div className="-m-4 md:-m-6 lg:-m-8 h-[calc(100vh-4rem)] lg:h-screen overflow-hidden">
        <div className="h-full flex overflow-hidden">
          {/* Conversation List - Fixed height, internal scroll */}
          <div className={`w-full md:w-96 border-r bg-card ${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col overflow-hidden`}>
            <ConversationList
              onSelectConversation={setSelectedConversation}
              onNewChat={handleNewChat}
              onNewGroup={handleNewGroup}
            />
          </div>

          {/* Chat Interface - Fixed height, internal scroll */}
          <div className={`flex-1 ${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-col bg-card overflow-hidden`}>
            {selectedConversation ? (
              <ChatInterface
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <MessageSquare className="w-24 h-24 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-xl font-semibold mb-2">Select a chat to start messaging</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list
                  </p>
                </div>
              </div>
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
