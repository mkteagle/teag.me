"use client";
import { useState, useEffect } from "react";
// This will only be active in development mode
const MOCK_USER_AGENTS = {
  iosSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1",
  iosInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 187.0.0.32.120",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36",
  androidFacebook:
    "Mozilla/5.0 (Linux; Android 11; Pixel 5 Build/RD1A.201105.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/345.0.0.34.118;]",
};

export function useMockUserAgent() {
  const [mockUserAgent, setMockUserAgent] = useState<string | null>(null);

  // Only enable mocking in development
  const isDevEnvironment = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDevEnvironment && mockUserAgent) {
      // Override the userAgent getter
      Object.defineProperty(navigator, "userAgent", {
        get: () => mockUserAgent,
        configurable: true,
      });
    }
  }, [mockUserAgent, isDevEnvironment]);

  const setUserAgentType = (type: keyof typeof MOCK_USER_AGENTS | null) => {
    if (!isDevEnvironment) return;
    setMockUserAgent(type ? MOCK_USER_AGENTS[type] : null);
  };

  return { setUserAgentType, MOCK_USER_AGENTS };
}
