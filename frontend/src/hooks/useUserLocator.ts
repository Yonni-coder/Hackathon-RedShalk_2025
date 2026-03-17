import { useState, useCallback } from "react";

export function useUserLocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback((options?: PositionOptions) => {
    if (!("geolocation" in navigator)) {
      setError("Géolocalisation non supportée par le navigateur.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Erreur d'accès à la géolocalisation.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000, ...(options || {}) }
    );
  }, []);

  return { position, loading, error, requestLocation, setPosition };
}
