import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageCircle, Users, RefreshCw } from 'lucide-react';
import NewDmDialog from './NewDmDialog';
import CreateGroupDialog from './CreateGroupDialog';
import type { Conversation } from '../../pages/ChatHomePage';

interface ConversationListProps {
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationList({
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewDm, setShowNewDm] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleAddConversation = (conversation: Conversation) => {
    const exists = conversations.find(c => c.id === conversation.id);
    if (!exists) {
      setConversations(prev => [conversation, ...prev]);
    }
    onSelectConversation(conversation);
  };

  const handleRefresh = () => {
    // Trigger a manual refresh - in a real app this would refetch data
    console.log('Refreshing conversations...');
  };

  return (
    <>
      <div className="shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Chats</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button
                variant="default"
                size="icon"
                onClick={() => setShowActions(!showActions)}
                title="New Chat"
              >
                <Plus className="h-5 w-5" />
              </Button>
              
              {showActions && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-12 z-20 w-48 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setShowNewDm(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 text-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      New Direct Message
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateGroup(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 text-sm border-t border-border"
                    >
                      <Users className="h-4 w-4" />
                      Create Group
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {conversation.type === 'dm' ? (
                      <MessageCircle className="h-6 w-6 text-primary" />
                    ) : (
                      <Users className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">{conversation.name}</h3>
                      {conversation.type === 'group' && (
                        <span className="text-xs text-muted-foreground ml-2">Group</span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <NewDmDialog
        open={showNewDm}
        onOpenChange={setShowNewDm}
        onConversationCreated={handleAddConversation}
      />

      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onGroupCreated={handleAddConversation}
      />
    </>
  );
}
