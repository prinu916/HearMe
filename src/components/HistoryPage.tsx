import React, { useEffect } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, MapPin, Clock } from 'lucide-react';
import { useEmergencyHistory } from '@/hooks/useEmergencyHistory';
import { format } from 'date-fns';

interface HistoryPageProps {
  onBack: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const { history, loading, fetchHistory } = useEmergencyHistory();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Emergency History</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No Emergency Events</p>
            <p className="text-muted-foreground">Past emergency triggers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((event) => (
              <div 
                key={event.id}
                className={`glass-card rounded-xl p-4 ${
                  event.was_false_alarm ? 'border-l-4 border-l-warning' : 
                  event.alerts_sent ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.was_false_alarm ? 'bg-warning/20' : 'bg-primary/20'
                    }`}>
                      {event.was_false_alarm ? (
                        <XCircle className="w-4 h-4 text-warning" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {event.was_false_alarm ? 'False Alarm' : 'Emergency Detected'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(event.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {Math.round(event.confidence * 100)}%
                    </span>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {event.detected_keywords.map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-secondary text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* Location */}
                {(event.latitude && event.longitude) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {event.address || `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`}
                    </span>
                  </div>
                )}

                {/* Alert Status */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  {event.alerts_sent ? (
                    <div className="flex items-center gap-1 text-success text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Alerts sent to contacts
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <XCircle className="w-4 h-4" />
                      Alerts not sent
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
