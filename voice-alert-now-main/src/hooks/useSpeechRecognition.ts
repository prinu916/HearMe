import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

const EMERGENCY_KEYWORDS = [
  'help', 'bachao', 'sos', 'accident', 'police', 
  'emergency', 'fire', 'ambulance', 'danger', 'attack',
  'save me', 'call police', 'mujhe bachao', 'madad'
];

export const useEmergencyDetection = () => {
  const analyzeForEmergency = useCallback((text: string, baseConfidence: number): { 
    isEmergency: boolean; 
    confidence: number; 
    detectedKeywords: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  } => {
    const lowerText = text.toLowerCase();
    const detectedKeywords: string[] = [];
    let keywordScore = 0;

    EMERGENCY_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        keywordScore += 1;
      }
    });

    // Check for repetition (e.g., "help help help")
    const repetitionBonus = (lowerText.match(/help|bachao|sos/gi) || []).length > 1 ? 0.2 : 0;
    
    // Check for urgency indicators
    const urgencyWords = ['please', 'now', 'quickly', 'fast', 'hurry', 'jaldi'];
    const hasUrgency = urgencyWords.some(word => lowerText.includes(word));
    const urgencyBonus = hasUrgency ? 0.1 : 0;

    // Calculate final confidence
    const keywordConfidence = Math.min(keywordScore * 0.3, 0.9);
    const finalConfidence = Math.min(
      (baseConfidence * 0.3) + keywordConfidence + repetitionBonus + urgencyBonus,
      1.0
    );

    // Determine urgency level
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (finalConfidence >= 0.9) urgencyLevel = 'critical';
    else if (finalConfidence >= 0.7) urgencyLevel = 'high';
    else if (finalConfidence >= 0.5) urgencyLevel = 'medium';

    return {
      isEmergency: finalConfidence >= 0.6 && detectedKeywords.length > 0,
      confidence: finalConfidence,
      detectedKeywords,
      urgencyLevel
    };
  }, []);

  return { analyzeForEmergency, EMERGENCY_KEYWORDS };
};

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          maxConfidence = Math.max(maxConfidence, result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
          maxConfidence = Math.max(maxConfidence, result[0].confidence || 0.5);
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      setConfidence(maxConfidence);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        try {
          recognitionRef.current?.start();
        } catch (e) {
          console.log('Recognition restart failed');
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, isListening]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported');
      return;
    }

    setError(null);
    setTranscript('');
    setConfidence(0);
    setIsListening(true);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.log('Stop failed');
    }
  }, []);

  return {
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    isSupported
  };
};
