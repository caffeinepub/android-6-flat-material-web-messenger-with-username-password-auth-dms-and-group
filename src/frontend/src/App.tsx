import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatHomePage from './pages/ChatHomePage';
import AppShell from './components/material/AppShell';
import { Toaster } from '@/components/ui/sonner';

// Layout component that wraps authenticated pages
function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

// Root component for routing
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const needsProfile = isAuthenticated && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (needsProfile) {
    return <RegisterPage />;
  }

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Chat route
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AuthenticatedLayout,
});

const chatIndexRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: '/',
  component: ChatHomePage,
});

// Create router
const routeTree = rootRoute.addChildren([chatRoute.addChildren([chatIndexRoute])]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
