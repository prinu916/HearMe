import React from 'react';
import { Shield, ShieldOff, Wifi, Battery } from 'lucide-react';

interface StatusBarProps {
  isActive: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      {/* App Status */}
      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <Shield className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success">Protected</span>
          </>
        ) : (
          <>
            <ShieldOff className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Inactive</span>
          </>
        )}
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <Wifi className="w-4 h-4" />
        <Battery className="w-4 h-4" />
      </div>
    </div>
  );
};
