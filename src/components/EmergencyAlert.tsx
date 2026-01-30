import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Phone, MessageSquare, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { useEmergencyHistory } from '@/hooks/useEmergencyHistory';
import { EmergencyContact } from '@/hooks/useEmergencyContacts';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface EmergencyAlertProps {
  detectedKeywords: string[];
  confidence: number;
  location: Location | null;
  contacts: EmergencyContact[];
  onDismiss: () => void;
  onConfirmFalseAlarm: () => void;
}

const FIRST_AID_TIPS = [
  'Stay calm and breathe slowly',
  'If injured, apply pressure to any bleeding wounds',
  'Do not move if you suspect spinal injury',
  'Help is on the way - stay where you are',
];

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  detectedKeywords,
  confidence,
  location,
  contacts,
  onDismiss,
  onConfirmFalseAlarm
}) => {
  const [alertsSent, setAlertsSent] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { playAlarmSound, playAlertSentSound } = useAudioFeedback();
  const { logEmergency } = useEmergencyHistory();

  // Play alarm on mount
  useEffect(() => {
    playAlarmSound();
  }, [playAlarmSound]);

  useEffect(() => {
    // Simulate sending alerts after countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAlertsSent(true);
          playAlertSentSound();
          
          // Log emergency event
          logEmergency({
            detected_keywords: detectedKeywords,
            confidence,
            latitude: location?.latitude,
            longitude: location?.longitude,
            address: location?.address,
            alerts_sent: true,
            was_false_alarm: false
          });
          
          // Simulate console alert
          console.log('🚨 EMERGENCY ALERT SENT!');
          console.log('Location:', location);
          console.log('Detected keywords:', detectedKeywords);
          console.log('Contacts notified:', contacts);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location, detectedKeywords, contacts, playAlertSentSound, logEmergency, confidence]);

  const handleFalseAlarm = () => {
    logEmergency({
      detected_keywords: detectedKeywords,
      confidence,
      latitude: location?.latitude,
      longitude: location?.longitude,
      address: location?.address,
      alerts_sent: false,
      was_false_alarm: true
    });
    onConfirmFalseAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Alert Header */}
        <div className="emergency-gradient rounded-t-2xl p-6 text-center">
          <div className="animate-shake mb-4">
            <AlertTriangle className="w-20 h-20 mx-auto text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground mb-2">
            EMERGENCY DETECTED
          </h1>
          <p className="text-primary-foreground/90">
            Confidence: {Math.round(confidence * 100)}%
          </p>
        </div>

        {/* Alert Body */}
        <div className="bg-card rounded-b-2xl p-6 space-y-6 border border-t-0 border-border">
          {/* Detected Keywords */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Detected Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {detectedKeywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {keyword.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Your Location
            </h3>
            {location ? (
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-sm font-medium">{location.address || 'Location detected'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Fetching location...</p>
            )}
          </div>

          {/* Alert Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Alert Status
            </h3>
            {!alertsSent ? (
              <div className="bg-warning/10 rounded-lg p-4 text-center">
                <p className="text-warning font-medium">
                  Sending alerts in {countdown} seconds...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tap "False Alarm" to cancel
                </p>
              </div>
            ) : (
              <div className="bg-success/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-success mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Alerts Sent!</span>
                </div>
                <div className="space-y-1">
                  {contacts.map((contact, index) => (
                    <div key={contact.id || index} className="flex items-center justify-between text-sm">
                      <span>{contact.name}</span>
                      <span className="text-muted-foreground">{contact.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* First Aid Tips */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">First Aid Tips</h3>
            <ul className="space-y-2">
              {FIRST_AID_TIPS.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!alertsSent && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleFalseAlarm}
              >
                <X className="w-4 h-4 mr-2" />
                False Alarm
              </Button>
            )}
            <Button
              className="flex-1 emergency-gradient"
              onClick={() => window.open('tel:112')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 112
            </Button>
          </div>

          {alertsSent && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onDismiss}
            >
              Close Alert
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
