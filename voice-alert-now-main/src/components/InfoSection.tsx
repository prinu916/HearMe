import React from 'react';
import { AlertTriangle, Mic, MapPin, Bell } from 'lucide-react';

export const InfoSection: React.FC = () => {
  const features = [
    {
      icon: Mic,
      title: 'Voice Detection',
      description: 'Listens for emergency keywords in any language'
    },
    {
      icon: AlertTriangle,
      title: 'AI Analysis',
      description: 'Analyzes urgency and confirms emergency intent'
    },
    {
      icon: MapPin,
      title: 'Location Tracking',
      description: 'Automatically fetches your GPS coordinates'
    },
    {
      icon: Bell,
      title: 'Instant Alerts',
      description: 'Notifies emergency contacts immediately'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-center mb-4">How It Works</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="glass-card rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
