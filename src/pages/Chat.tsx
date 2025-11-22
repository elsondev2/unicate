import { useState } from 'react';
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
    window.location.reload();
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          onSelectConversation={setSelectedConversation}
          onNewChat={handleNewChat}
          onNewGroup={handleNewGroup}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#f0f2f5]">
            <div className="text-center">
              <MessageSquare className="w-24 h-24 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
              <p className="text-xl font-medium text-gray-700">Select a chat to start messaging</p>
              <p className="text-sm text-gray-500 mt-2">Choose a conversation from the list</p>
            </div>
          </div>
        )}
      </div>

      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        mode={chatMode}
        onSuccess={handleChatCreated}
      />
    </div>
  );
}
