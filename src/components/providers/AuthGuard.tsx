'use client';

import { useAuthStore } from '@/stores/auth-store';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { useMounted } from '@/hooks/use-mounted';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const currentUser = useAuthStore((s) => s.currentUser);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
