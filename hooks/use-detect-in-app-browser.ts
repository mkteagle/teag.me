import { useState, useEffect } from "react";

export const useDetectInAppBrowser = () => {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor;
    const inAppBrowser = /FBAN|FBAV|Instagram|LinkedIn|Twitter/i.test(ua);
    setIsInAppBrowser(inAppBrowser);
  }, []);

  return isInAppBrowser;
};
