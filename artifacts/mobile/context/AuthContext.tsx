import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthUser {
  userId: string;
  phoneHash: string;
  phoneDisplay: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hashPhone(phone: string): string {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    const c = phone.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `+*** *** **${digits.slice(-2)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(["helfer_user_id", "helfer_phone_hash", "helfer_phone_display"])
      .then(([idEntry, hashEntry, displayEntry]) => {
        const userId = idEntry[1];
        const phoneHash = hashEntry[1];
        const phoneDisplay = displayEntry[1];
        if (userId && phoneHash && phoneDisplay) {
          setUser({ userId, phoneHash, phoneDisplay });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (phone: string) => {
    const phoneHash = hashPhone(phone);
    const userId = `u_${phoneHash}_${Date.now().toString(36)}`;
    const phoneDisplay = maskPhone(phone);
    await AsyncStorage.multiSet([
      ["helfer_user_id", userId],
      ["helfer_phone_hash", phoneHash],
      ["helfer_phone_display", phoneDisplay],
    ]);
    setUser({ userId, phoneHash, phoneDisplay });
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(["helfer_user_id", "helfer_phone_hash", "helfer_phone_display"]);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
