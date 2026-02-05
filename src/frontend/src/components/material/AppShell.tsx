import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Material-style App Bar */}
      <header className="h-16 bg-primary text-primary-foreground shadow-md flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/app-icon.dim_512x512.png" 
            alt="App Icon" 
            className="w-10 h-10"
          />
          <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm font-medium">
            {userProfile?.displayName || 'User'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary-foreground/10"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
