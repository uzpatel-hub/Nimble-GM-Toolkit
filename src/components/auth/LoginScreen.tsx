'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, User } from 'lucide-react';

export function LoginScreen() {
  const { knownUsers, error, login } = useAuthStore();
  const [username, setUsername] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim()) login(username);
  }

  function handleQuickLogin(user: string) {
    login(user);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-texture p-4">
      <Card className="w-full max-w-md card-elevated">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-gold-glow">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">
              Nimble GM Toolkit
            </CardTitle>
            <CardDescription className="mt-1">
              Enter your username to access your campaigns
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dungeon_master"
                autoFocus
                autoComplete="off"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={!username.trim()}>
              Continue
            </Button>
          </form>

          {knownUsers.length > 0 && (
            <div className="space-y-3">
              <div className="divider-ornament text-xs font-medium uppercase tracking-wider">
                or continue as
              </div>
              <div className="grid gap-2">
                {knownUsers.map((user) => (
                  <Button
                    key={user}
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => handleQuickLogin(user)}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    {user}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
