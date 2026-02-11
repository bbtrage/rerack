import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();

  // If Supabase is not configured, skip auth and show main app
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-accent-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show fallback (auth pages) if not authenticated
  if (!user) {
    return <>{fallback}</>;
  }

  // Show main app if authenticated
  return <>{children}</>;
}
