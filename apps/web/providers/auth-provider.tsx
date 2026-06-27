"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextProps {
  userId: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  userId: null,
});

const PUBLIC_PATHS = ["/auth/login", "/r", "/not-found", "/privacy", "/terms"]; // Added /r to public paths

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedUserId = window.localStorage.getItem("userId");
    setUserId(storedUserId);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Check if current path starts with any public path
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (userId && pathname === "/auth/login") {
      router.push("/");
    } else if (!userId && !isPublicPath) {
      router.push("/auth/login");
    }
  }, [userId, pathname, router, isInitialized]);

  return (
    <AuthContext.Provider value={{ userId }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
