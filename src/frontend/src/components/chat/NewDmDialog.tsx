import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import type { Conversation } from '../../pages/ChatHomePage';

interface NewDmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export default function NewDmDialog({ open, onOpenChange, onConversationCreated }: NewDmDialogProps) {
  const [principalText, setPrincipalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!principalText.trim()) {
      toast.error('Please enter a Principal ID');
      return;
    }

    setIsLoading(true);
    try {
      const principal = Principal.fromText(principalText.trim());
      
      const conversation: Conversation = {
        id: `dm-${principal.toString()}`,
        type: 'dm',
        name: principal.toString().slice(0, 10) + '...',
        recipient: principal,
      };

      onConversationCreated(conversation);
      toast.success('Direct message started!');
      setPrincipalText('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Invalid Principal ID. Please check and try again.');
      console.error('Principal parsing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Direct Message</DialogTitle>
          <DialogDescription>
            Enter the Principal ID of the person you want to message
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal ID</Label>
              <Input
                id="principal"
                placeholder="Enter Principal ID"
                value={principalText}
                onChange={(e) => setPrincipalText(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Ask your friend for their Principal ID to start chatting
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Start Chat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
