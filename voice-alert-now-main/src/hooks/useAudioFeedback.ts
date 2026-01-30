import { useCallback, useRef } from 'react';

export const useAudioFeedback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playAlarmSound = useCallback(() => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Emergency alarm: alternating frequencies
    const now = audioContext.currentTime;
    
    // Create urgent siren pattern
    for (let i = 0; i < 6; i++) {
      oscillator.frequency.setValueAtTime(800, now + i * 0.3);
      oscillator.frequency.setValueAtTime(600, now + i * 0.3 + 0.15);
    }

    // Fade in and out for each beep
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 1.7);
    gainNode.gain.linearRampToValueAtTime(0, now + 1.8);

    oscillator.type = 'square';
    oscillator.start(now);
    oscillator.stop(now + 1.8);
  }, [getAudioContext]);

  const playConfirmationBeep = useCallback(() => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;

    // Two short ascending beeps for confirmation
    oscillator.frequency.setValueAtTime(440, now);
    oscillator.frequency.setValueAtTime(660, now + 0.15);
    oscillator.frequency.setValueAtTime(880, now + 0.3);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gainNode.gain.setValueAtTime(0.3, now + 0.4);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.45);

    oscillator.type = 'sine';
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }, [getAudioContext]);

  const playAlertSentSound = useCallback(() => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;

    // Success sound: three ascending tones
    oscillator.frequency.setValueAtTime(523, now); // C5
    oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, now + 0.2); // G5

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gainNode.gain.setValueAtTime(0.25, now + 0.28);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.35);

    oscillator.type = 'sine';
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }, [getAudioContext]);

  return {
    playAlarmSound,
    playConfirmationBeep,
    playAlertSentSound
  };
};
