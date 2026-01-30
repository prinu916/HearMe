import React from 'react';
import { Settings, History, User, LogOut, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NavigationProps {
  onNavigate: (page: 'home' | 'settings' | 'history' | 'auth') => void;
  isAuthenticated: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate, isAuthenticated }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
  };

  return (
    <div className="flex items-center justify-around p-4 border-t border-border bg-card">
      <button 
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        <Shield className="w-5 h-5 text-primary" />
        <span className="text-xs">Home</span>
      </button>

      <button 
        onClick={() => onNavigate('history')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        <History className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs">History</span>
      </button>

      <button 
        onClick={() => onNavigate('settings')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs">Settings</span>
      </button>

      {isAuthenticated ? (
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs">Logout</span>
        </button>
      ) : (
        <button 
          onClick={() => onNavigate('auth')}
          className="flex flex-col items-center gap-1 p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs">Sign In</span>
        </button>
      )}
    </div>
  );
};
