import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, RefreshCw, UserPlus } from 'lucide-react';
import { useGetDirectMessages, useSendDirectMessage, useGetGroupMessages, useSendGroupMessage } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Conversation } from '../../pages/ChatHomePage';
import AddParticipantDialog from './AddParticipantDialog';

interface ThreadViewProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ThreadView({ conversation, onBack }: ThreadViewProps) {
  const [message, setMessage] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const { identity } = useInternetIdentity();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDm = conversation.type === 'dm';
  
  const { data: dmMessages = [], refetch: refetchDm } = useGetDirectMessages(
    isDm ? conversation.recipient || null : null,
    isDm
  );
  
  const { data: groupMessages = [], refetch: refetchGroup } = useGetGroupMessages(
    !isDm ? conversation.id : null,
    !isDm
  );

  const sendDm = useSendDirectMessage();
  const sendGroup = useSendGroupMessage();

  const messages = isDm ? dmMessages : groupMessages;
  const currentUserPrincipal = identity?.getPrincipal().toString();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    try {
      if (isDm && conversation.recipient) {
        await sendDm.mutateAsync({
          recipient: conversation.recipient,
          content: message.trim(),
        });
      } else if (!isDm) {
        await sendGroup.mutateAsync({
          groupId: conversation.id,
          content: message.trim(),
        });
      }
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Send message error:', error);
    }
  };

  const handleRefresh = () => {
    if (isDm) {
      refetchDm();
    } else {
      refetchGroup();
    }
    toast.success('Messages refreshed');
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Thread Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-base">{conversation.name}</h2>
              <p className="text-xs text-muted-foreground">
                {isDm ? 'Direct Message' : 'Group Chat'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isDm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddParticipant(true)}
                title="Add Participant"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              title="Refresh Messages"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Send a message to start the conversation</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwnMessage = msg.sender.toString() === currentUserPrincipal;
                return (
                  <div
                    key={index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {!isOwnMessage && !isDm && (
                        <p className="text-xs opacity-70 mb-1">
                          {msg.sender.toString().slice(0, 8)}...
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border p-4 shrink-0 bg-card">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sendDm.isPending || sendGroup.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sendDm.isPending || sendGroup.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {!isDm && (
        <AddParticipantDialog
          open={showAddParticipant}
          onOpenChange={setShowAddParticipant}
          groupId={conversation.id}
        />
      )}
    </>
  );
}
