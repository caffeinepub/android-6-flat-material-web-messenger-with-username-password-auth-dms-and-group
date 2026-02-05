import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Principal } from '@dfinity/principal';
import { useAddParticipant } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export default function AddParticipantDialog({ open, onOpenChange, groupId }: AddParticipantDialogProps) {
  const [principalText, setPrincipalText] = useState('');
  const addParticipant = useAddParticipant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!principalText.trim()) {
      toast.error('Please enter a Principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalText.trim());
      
      await addParticipant.mutateAsync({
        groupId,
        participant: principal,
      });

      toast.success('Participant added successfully!');
      setPrincipalText('');
      onOpenChange(false);
    } catch (error: any) {
      if (error.message?.includes('Unauthorized')) {
        toast.error('Only the group creator can add participants');
      } else if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid Principal ID. Please check and try again.');
      } else {
        toast.error('Failed to add participant. Please try again.');
      }
      console.error('Add participant error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Enter the Principal ID of the person you want to add to this group
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="participant">Principal ID</Label>
              <Input
                id="participant"
                placeholder="Enter Principal ID"
                value={principalText}
                onChange={(e) => setPrincipalText(e.target.value)}
                disabled={addParticipant.isPending}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addParticipant.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addParticipant.isPending}>
              {addParticipant.isPending ? 'Adding...' : 'Add Participant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
