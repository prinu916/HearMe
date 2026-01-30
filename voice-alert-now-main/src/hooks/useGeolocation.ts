import { useState, useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  fetchLocation: () => Promise<Location | null>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async (): Promise<Location | null> => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      // Return mock location for demo
      const mockLocation = {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 100,
        address: 'New Delhi, India (Demo Location)'
      };
      setLocation(mockLocation);
      return mockLocation;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          // Try to get address using reverse geocoding (mock for demo)
          try {
            loc.address = `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
          } catch {
            loc.address = 'Location detected';
          }

          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Provide mock location for demo
          const mockLocation = {
            latitude: 28.6139,
            longitude: 77.2090,
            accuracy: 100,
            address: 'New Delhi, India (Demo Location)'
          };
          setLocation(mockLocation);
          setLoading(false);
          resolve(mockLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  return { location, loading, error, fetchLocation };
};
