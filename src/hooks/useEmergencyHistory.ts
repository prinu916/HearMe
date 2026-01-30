import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyEvent {
  id: string;
  detected_keywords: string[];
  confidence: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  alerts_sent: boolean;
  was_false_alarm: boolean;
  created_at: string;
}

export const useEmergencyHistory = () => {
  const [history, setHistory] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logEmergency = useCallback(async (event: {
    detected_keywords: string[];
    confidence: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    alerts_sent?: boolean;
    was_false_alarm?: boolean;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('emergency_history')
        .insert({
          user_id: user?.id || null,
          detected_keywords: event.detected_keywords,
          confidence: event.confidence,
          latitude: event.latitude,
          longitude: event.longitude,
          address: event.address,
          alerts_sent: event.alerts_sent || false,
          was_false_alarm: event.was_false_alarm || false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging emergency:', error);
    }
  }, []);

  return {
    history,
    loading,
    fetchHistory,
    logEmergency
  };
};
