import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ConversationList from '../components/chat/ConversationList';
import ThreadView from '../components/chat/ThreadView';
import { Principal } from '@dfinity/principal';

export type ConversationType = 'dm' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  lastMessage?: string;
  lastMessageTime?: number;
  recipient?: Principal;
}

export default function ChatHomePage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobileThreadView, setIsMobileThreadView] = useState(false);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsMobileThreadView(true);
  };

  const handleBackToList = () => {
    setIsMobileThreadView(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Conversation List - Hidden on mobile when thread is open */}
      <div className={`${isMobileThreadView ? 'hidden' : 'flex'} md:flex w-full md:w-80 lg:w-96 border-r border-border flex-col`}>
        <ConversationList
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Thread View - Hidden on mobile when no conversation selected */}
      <div className={`${!isMobileThreadView && !selectedConversation ? 'hidden' : 'flex'} md:flex flex-1 flex-col`}>
        {selectedConversation ? (
          <ThreadView
            conversation={selectedConversation}
            onBack={handleBackToList}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
            <div className="text-center space-y-3 px-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <img 
                  src="/assets/generated/app-icon.dim_512x512.png" 
                  alt="App Icon" 
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Welcome, {userProfile?.displayName || 'User'}!
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Select a conversation from the list or start a new chat to begin messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
