import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { usePostLocation } from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";

interface LocationData {
  lat: number;
  lng: number;
  speed: number;
  accuracy: number;
  heading: number;
  timestamp: number;
}

interface TrackingContextValue {
  isTracking: boolean;
  currentLocation: LocationData | null;
  toggleTracking: () => void;
  inCluster: boolean;
  pendingClusterId: string | null;
  dismissCluster: () => void;
  confirmCluster: (isBus: boolean) => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);
const QUEUE_KEY = "helfer_ping_queue";

function getAdaptiveInterval(speedMs: number): number {
  if (speedMs > 5) return 5000;
  if (speedMs > 1) return 10000;
  return 60000;
}

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [inCluster, setInCluster] = useState(false);
  const [pendingClusterId, setPendingClusterId] = useState<string | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeedRef = useRef(0);

  const { mutate: postLocation } = usePostLocation();

  const flushQueue = useCallback(async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (!raw) return;
      const queue: LocationData[] = JSON.parse(raw);
      if (queue.length === 0) return;
      await AsyncStorage.removeItem(QUEUE_KEY);
      for (const loc of queue) {
        postLocation({
          data: {
            userId,
            lat: loc.lat,
            lng: loc.lng,
            speed: loc.speed,
            accuracy: loc.accuracy,
            heading: loc.heading,
            timestamp: loc.timestamp,
          },
        });
      }
    } catch {}
  }, [postLocation]);

  const sendPing = useCallback(
    (loc: LocationData, userId: string) => {
      postLocation(
        {
          data: {
            userId,
            lat: loc.lat,
            lng: loc.lng,
            speed: loc.speed,
            accuracy: loc.accuracy,
            heading: loc.heading,
            timestamp: loc.timestamp,
          },
        },
        {
          onSuccess: (data) => {
            if (data.inCluster && data.clusterId && !pendingClusterId) {
              setInCluster(true);
              setPendingClusterId(data.clusterId);
            } else if (!data.inCluster) {
              setInCluster(false);
            }
          },
          onError: async () => {
            try {
              const raw = await AsyncStorage.getItem(QUEUE_KEY);
              const queue: LocationData[] = raw ? JSON.parse(raw) : [];
              queue.push(loc);
              await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
            } catch {}
          },
        },
      );
    },
    [postLocation, pendingClusterId],
  );

  const startTracking = useCallback(async () => {
    if (!user) return;

    if (Platform.OS === "web") {
      if (!navigator.geolocation) return;
      setIsTracking(true);
      await flushQueue(user.userId);
      const tick = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc: LocationData = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              speed: pos.coords.speed ?? 0,
              accuracy: pos.coords.accuracy,
              heading: pos.coords.heading ?? 0,
              timestamp: pos.timestamp,
            };
            lastSpeedRef.current = loc.speed;
            setCurrentLocation(loc);
            sendPing(loc, user.userId);
            const next = getAdaptiveInterval(loc.speed);
            intervalRef.current = setTimeout(tick, next);
          },
          () => {
            intervalRef.current = setTimeout(tick, 10000);
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      };
      tick();
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    setIsTracking(true);
    await flushQueue(user.userId);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 5000,
      },
      (pos) => {
        const loc: LocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed ?? 0,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading ?? 0,
          timestamp: pos.timestamp,
        };
        lastSpeedRef.current = loc.speed;
        setCurrentLocation(loc);
        sendPing(loc, user.userId);
      },
    );
  }, [user, sendPing, flushQueue]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const dismissCluster = useCallback(() => {
    setInCluster(false);
    setPendingClusterId(null);
  }, []);

  const confirmCluster = useCallback(
    (_isBus: boolean) => {
      setInCluster(false);
      setPendingClusterId(null);
    },
    [],
  );

  return (
    <TrackingContext.Provider
      value={{
        isTracking,
        currentLocation,
        toggleTracking,
        inCluster,
        pendingClusterId,
        dismissCluster,
        confirmCluster,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking(): TrackingContextValue {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error("useTracking must be used within TrackingProvider");
  return ctx;
}
