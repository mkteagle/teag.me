"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextProps {
  userId: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  userId: null,
});

const PUBLIC_PATHS = ["/auth/login"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedUserId = window.localStorage.getItem("userId");
    console.log("Initial localStorage userId:", storedUserId);
    setUserId(storedUserId);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    console.log("Auth state:", {
      userId,
      pathname,
      isPublicPath,
    });

    if (userId && isPublicPath) {
      // If user is logged in and on a public path (like login), redirect to home
      router.push("/");
    } else if (!userId && !isPublicPath) {
      // If user is not logged in and trying to access a protected path
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
