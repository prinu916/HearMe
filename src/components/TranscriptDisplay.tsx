import React from 'react';
import { MessageCircle } from 'lucide-react';

interface TranscriptDisplayProps {
  transcript: string;
  confidence: number;
  isListening: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  confidence,
  isListening
}) => {
  if (!isListening && !transcript) return null;

  return (
    <div className="glass-card rounded-xl p-4 mx-4 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Detected Speech</span>
        {confidence > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>
      
      <p className="text-foreground min-h-[1.5rem]">
        {transcript || (
          <span className="text-muted-foreground italic">Waiting for speech...</span>
        )}
      </p>
    </div>
  );
};
