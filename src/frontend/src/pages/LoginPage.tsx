import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { MessageCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="absolute inset-0 bg-[url('/assets/generated/material-bg.dim_1920x1080.png')] bg-cover bg-center opacity-5" />
      
      <Card className="w-full max-w-md relative shadow-lg">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <img 
              src="/assets/generated/app-icon.dim_512x512.png" 
              alt="App Icon" 
              className="w-16 h-16"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to start messaging your friends
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Signing in...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-5 w-5" />
                Sign In
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground px-4">
            Secure authentication powered by Internet Identity
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
