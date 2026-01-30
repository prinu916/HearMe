import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface ListeningIndicatorProps {
  isListening: boolean;
  onToggle: () => void;
}

export const ListeningIndicator: React.FC<ListeningIndicatorProps> = ({ 
  isListening, 
  onToggle 
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main listening button */}
      <button
        onClick={onToggle}
        className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'emergency-gradient animate-pulse-glow' 
            : 'bg-muted hover:bg-muted/80'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full emergency-gradient animate-pulse-ring" />
            <span className="absolute inset-0 rounded-full emergency-gradient animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
            <span className="absolute inset-0 rounded-full emergency-gradient animate-pulse-ring" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        {/* Icon */}
        <div className="relative z-10">
          {isListening ? (
            <Mic className="w-12 h-12 text-primary-foreground" />
          ) : (
            <MicOff className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Status text */}
      <div className="text-center">
        <p className={`text-lg font-semibold ${isListening ? 'text-primary' : 'text-muted-foreground'}`}>
          {isListening ? 'Listening...' : 'Tap to Start'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isListening 
            ? 'Say "Help", "SOS", or "Bachao" for emergency' 
            : 'Microphone is off'}
        </p>
      </div>

      {/* Sound wave visualization */}
      {isListening && (
        <div className="flex items-center justify-center gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-listening-wave"
              style={{
                height: '100%',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
