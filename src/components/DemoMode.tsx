import React, { useState } from 'react';
import { Terminal, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DemoModeProps {
  onSimulateVoice: (text: string) => void;
  emergencyKeywords: string[];
}

const QUICK_PHRASES = [
  'Help me please!',
  'Bachao bachao!',
  'SOS emergency',
  'There has been an accident',
  'Call the police now',
  'I need help urgently',
];

export const DemoMode: React.FC<DemoModeProps> = ({ 
  onSimulateVoice, 
  emergencyKeywords 
}) => {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSimulateVoice(inputText);
      setInputText('');
    }
  };

  const handleQuickPhrase = (phrase: string) => {
    onSimulateVoice(phrase);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-foreground text-background rounded-full shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Open demo mode"
      >
        <Terminal className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 glass-card rounded-2xl p-4 max-w-md mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Demo Mode</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-secondary rounded-lg mb-4">
        <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Simulate voice input by typing emergency phrases. Keywords: {emergencyKeywords.slice(0, 5).join(', ')}...
        </p>
      </div>

      {/* Quick phrases */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_PHRASES.map((phrase, index) => (
          <button
            key={index}
            onClick={() => handleQuickPhrase(phrase)}
            className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type to simulate voice..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
