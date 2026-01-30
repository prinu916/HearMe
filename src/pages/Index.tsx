import React, { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { StatusBar } from '@/components/StatusBar';
import { ListeningIndicator } from '@/components/ListeningIndicator';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { InfoSection } from '@/components/InfoSection';
import { DemoMode } from '@/components/DemoMode';
import { EmergencyAlert } from '@/components/EmergencyAlert';
import { Navigation } from '@/components/Navigation';
import { SettingsPage } from '@/components/SettingsPage';
import { HistoryPage } from '@/components/HistoryPage';
import { AuthPage } from '@/components/AuthPage';
import { useSpeechRecognition, useEmergencyDetection } from '@/hooks/useSpeechRecognition';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { auth } from '@/integrations/firebase/client';
import { onAuthStateChanged, User } from 'firebase/auth';

type PageType = 'home' | 'settings' | 'history' | 'auth';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [showEmergency, setShowEmergency] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emergencyData, setEmergencyData] = useState<{
    keywords: string[];
    confidence: number;
  } | null>(null);
  
  const {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    isSupported,
    hasPermission,
    requestMicrophonePermission,
    isSecureContext,
    isIOS
  } = useSpeechRecognition();
  
  const { analyzeForEmergency, EMERGENCY_KEYWORDS } = useEmergencyDetection();
  const { location, fetchLocation } = useGeolocation();
  const { contacts } = useEmergencyContacts();

  // Check auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Analyze transcript for emergencies
  useEffect(() => {
    if (transcript && isListening) {
      const result = analyzeForEmergency(transcript, confidence);

      if (result.isEmergency) {
        triggerEmergency(result.detectedKeywords, result.confidence);
      }
    }
  }, [transcript, confidence, isListening, analyzeForEmergency]);

  // Removed auto-start to give user control over when to start listening

  const triggerEmergency = useCallback(async (keywords: string[], conf: number) => {
    stopListening();
    await fetchLocation();
    setEmergencyData({ keywords, confidence: conf });
    setShowEmergency(true);
  }, [stopListening, fetchLocation]);

  const handleSimulatedVoice = useCallback((text: string) => {
    const result = analyzeForEmergency(text, 0.9);
    
    if (result.isEmergency) {
      triggerEmergency(result.detectedKeywords, result.confidence);
    }
  }, [analyzeForEmergency, triggerEmergency]);

  const handleToggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleDismissEmergency = useCallback(() => {
    setShowEmergency(false);
    setEmergencyData(null);
  }, []);

  const handleNavigate = useCallback((page: PageType) => {
    setCurrentPage(page);
  }, []);

  // Render pages
  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'history') {
    return <HistoryPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage 
        onBack={() => setCurrentPage('home')} 
        onSuccess={() => setCurrentPage('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Emergency Alert Overlay */}
      {showEmergency && emergencyData && (
        <EmergencyAlert
          detectedKeywords={emergencyData.keywords}
          confidence={emergencyData.confidence}
          location={location}
          contacts={contacts}
          onDismiss={handleDismissEmergency}
          onConfirmFalseAlarm={handleDismissEmergency}
        />
      )}

      {/* Status Bar */}
      <StatusBar isActive={isListening} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto pb-20">
        {/* Header */}
        <div className="text-center py-8 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl emergency-gradient mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Emergency Listener AI</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Voice-activated emergency detection. Just speak — we'll handle the rest.
          </p>
        </div>

        {/* Listening Control */}
        <div className="flex-1 flex flex-col items-center justify-center py-8">
        <ListeningIndicator
          isListening={isListening}
          onToggle={handleToggleListening}
          hasPermission={hasPermission}
          onRequestPermission={requestMicrophonePermission}
        />
        </div>

        {/* Transcript Display */}
        <TranscriptDisplay 
          transcript={transcript}
          confidence={confidence}
          isListening={isListening}
        />

        {/* Environment Warnings */}
        {!isSecureContext && (
          <div className="mx-4 mb-4 p-4 bg-warning/10 rounded-xl text-center">
            <p className="text-sm text-warning">
              ⚠️ Speech recognition requires HTTPS. For development, use localhost or deploy to HTTPS.
            </p>
          </div>
        )}

        {isIOS && (
          <div className="mx-4 mb-4 p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-sm text-blue-700">
              📱 iOS Safari detected. Speech recognition may have limitations. Try Chrome for Android instead.
            </p>
          </div>
        )}

        {/* Browser Support Warning */}
        {!isSupported && (
          <div className="mx-4 mb-4 p-4 bg-warning/10 rounded-xl text-center">
            <p className="text-sm text-warning">
              Speech recognition not supported in this browser. Use Chrome, Edge, or Safari. Try Demo Mode below.
            </p>
          </div>
        )}

        {/* Permission Warning */}
        {hasPermission === false && (
          <div className="mx-4 mb-4 p-4 bg-destructive/10 rounded-xl text-center">
            <p className="text-sm text-destructive">
              {error || 'Microphone permission denied. Click the microphone button to grant permission.'}
            </p>
          </div>
        )}

        {/* General Error Display */}
        {error && hasPermission !== false && (
          <div className="mx-4 mb-4 p-4 bg-orange-50 rounded-xl text-center">
            <p className="text-sm text-orange-700">
              {error}
            </p>
          </div>
        )}

        {/* Info Section */}
        <InfoSection />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <Navigation onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />
      </div>

      {/* Demo Mode */}
      <DemoMode 
        onSimulateVoice={handleSimulatedVoice}
        emergencyKeywords={EMERGENCY_KEYWORDS}
      />
    </div>
  );
};

export default Index;
