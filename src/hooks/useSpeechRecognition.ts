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
  startListening: () => Promise<void>;
  stopListening: () => void;
  isSupported: boolean;
  hasPermission: boolean | null;
  requestMicrophonePermission: () => Promise<boolean>;
  isSecureContext: boolean;
  isIOS: boolean;
  debugInfo: {
    browserSupport: boolean;
    secureContext: boolean;
    permissionState: string;
    lastError: string | null;
  };
}

const EMERGENCY_KEYWORDS = [
  'help', 'bachao', 'sos', 'accident', 'police',
  'emergency', 'fire', 'ambulance', 'danger', 'attack',
  'save me', 'call police', 'mujhe bachao', 'madad',
  'bachao mujhe', 'help me', 'emergency help', 's.o.s',
  'bachao please', 'save my life', 'danger danger'
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
      isEmergency: finalConfidence >= 0.4 && detectedKeywords.length > 0,
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);

  // Environment checks
  const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Check microphone permission
  const checkMicrophonePermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(permission.state === 'granted');
        return permission.state === 'granted';
      }
      return true; // Assume granted if permissions API not available
    } catch (e) {
      console.log('Permission check failed, assuming granted');
      setHasPermission(true);
      return true;
    }
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      console.log('Microphone permission granted');
      setHasPermission(true);
      setError(null);
      return true;
    } catch (e: any) {
      console.error('Microphone permission denied:', e);

      let errorMessage = 'Microphone access failed. ';

      if (e.name === 'NotAllowedError') {
        errorMessage += 'Permission was denied. Please click "Allow" when prompted, or enable microphone in browser settings.';
      } else if (e.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please check your microphone connection.';
      } else if (e.name === 'NotReadableError') {
        errorMessage += 'Microphone is already in use by another application.';
      } else if (e.name === 'OverconstrainedError') {
        errorMessage += 'Microphone does not meet the required constraints.';
      } else if (e.name === 'SecurityError') {
        errorMessage += 'Microphone access blocked due to security restrictions. Please use HTTPS.';
      } else if (e.name === 'AbortError') {
        errorMessage += 'Microphone access was interrupted.';
      } else {
        errorMessage += 'Please check your microphone settings and try again.';
      }

      setHasPermission(false);
      setError(errorMessage);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    checkMicrophonePermission();

    const SpeechRecognition = (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 3;

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Check all alternatives for better detection
          for (let j = 0; j < result.length; j++) {
            const alternative = result[j];
            if (alternative.confidence > maxConfidence) {
              finalTranscript = alternative.transcript;
              maxConfidence = alternative.confidence;
            }
          }
        } else {
          interimTranscript += result[0].transcript;
          maxConfidence = Math.max(maxConfidence, result[0].confidence || 0.5);
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      setConfidence(maxConfidence);

      // Log for debugging
      console.log('Speech detected:', currentTranscript, 'Confidence:', maxConfidence);
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

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition not supported');
      return;
    }

    // Request microphone permission if not already granted
    if (hasPermission === false) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        return;
      }
    } else if (hasPermission === null) {
      // Check permission status
      const permissionGranted = await checkMicrophonePermission();
      if (!permissionGranted) {
        const userGranted = await requestMicrophonePermission();
        if (!userGranted) {
          return;
        }
      }
    }

    setError(null);
    setTranscript('');
    setConfidence(0);
    setIsListening(true);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isSupported, hasPermission, requestMicrophonePermission, checkMicrophonePermission]);

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
    isSupported,
    hasPermission,
    requestMicrophonePermission,
    isSecureContext,
    isIOS,
    debugInfo: {
      browserSupport: isSupported,
      secureContext: isSecureContext,
      permissionState: hasPermission ? 'granted' : 'denied',
      lastError: error
    }
  };
};
