import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  endConnection,
  deepLinkToSubscriptions,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type ProductSubscription,
  type Purchase,
} from 'expo-iap';

import { authenticatedFetch } from './auth-client';

const PRODUCT_ID = 'me.teag.scanner.pro.monthly';

type EntitlementResponse = {
  appAccountToken: string;
  productId: string;
  plan: 'FREE' | 'PRO';
};

export function useStoreKitPro(userId?: string) {
  const [product, setProduct] = useState<ProductSubscription | null>(null);
  const [appAccountToken, setAppAccountToken] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const processed = useRef(new Set<string>());
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const processPurchase = useCallback(async (purchase: Purchase) => {
    const key = purchase.id || purchase.purchaseToken || `${purchase.productId}:${purchase.transactionDate}`;
    if (processed.current.has(key) || purchase.productId !== PRODUCT_ID || !purchase.purchaseToken) {
      setBusy(false);
      return false;
    }
    processed.current.add(key);
    try {
      const response = await authenticatedFetch('/api/app-store/entitlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedTransaction: purchase.purchaseToken }),
      });
      const body = await response.json() as { active?: boolean; error?: string };
      if (!response.ok || !body.active) throw new Error(body.error || 'Apple could not verify this subscription.');
      await finishTransaction({ purchase, isConsumable: false });
      setIsPro(true);
      setMessage('Pro is active. Your cloud history is now unlimited.');
      return true;
    } catch (error) {
      processed.current.delete(key);
      setMessage(error instanceof Error ? error.message : 'Purchase verification failed.');
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    processed.current.clear();
    if (!userId || Platform.OS !== 'ios') {
      setAppAccountToken(null);
      setIsPro(false);
      return;
    }

    let active = true;
    const purchaseUpdate = purchaseUpdatedListener((purchase) => {
      if (active && userIdRef.current) void processPurchase(purchase);
    });
    const purchaseError = purchaseErrorListener((error) => {
      if (!active) return;
      setBusy(false);
      if (error.code !== 'user-cancelled') setMessage(error.message);
    });

    void (async () => {
      try {
        const [connection, entitlementResponse] = await Promise.all([
          initConnection(),
          authenticatedFetch('/api/app-store/entitlement'),
        ]);
        if (!connection || !entitlementResponse.ok) throw new Error('The App Store is unavailable right now.');
        const entitlement = await entitlementResponse.json() as EntitlementResponse;
        if (!active) return;
        setAppAccountToken(entitlement.appAccountToken);
        setIsPro(entitlement.plan === 'PRO');
        const products = await fetchProducts({ skus: [PRODUCT_ID], type: 'subs' });
        const match = products?.find((item) => item.id === PRODUCT_ID);
        if (active && match) setProduct(match as ProductSubscription);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Unable to connect to the App Store.');
      }
    })();

    return () => {
      active = false;
      purchaseUpdate.remove();
      purchaseError.remove();
      void endConnection();
    };
  }, [processPurchase, userId]);

  const purchase = useCallback(async () => {
    if (!appAccountToken || Platform.OS !== 'ios') {
      setMessage('Sign in on an iPhone or iPad to subscribe.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await requestPurchase({
        request: { apple: { sku: PRODUCT_ID, appAccountToken } },
        type: 'subs',
      });
    } catch (error) {
      setBusy(false);
      setMessage(error instanceof Error ? error.message : 'Unable to start purchase.');
    }
  }, [appAccountToken]);

  const restore = useCallback(async () => {
    if (!userId || Platform.OS !== 'ios') return;
    setBusy(true);
    setMessage(null);
    try {
      const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: true });
      const matches = purchases.filter((item) => item.productId === PRODUCT_ID);
      if (matches.length === 0) {
        setMessage('No active teag.me Pro subscription was found for this Apple ID.');
        setBusy(false);
        return;
      }
      for (const item of matches) await processPurchase(item);
    } catch (error) {
      setBusy(false);
      setMessage(error instanceof Error ? error.message : 'Unable to restore purchases.');
    }
  }, [processPurchase, userId]);

  const manage = useCallback(async () => {
    try {
      await deepLinkToSubscriptions();
    } catch {
      setMessage('Open App Store settings to manage your subscription.');
    }
  }, []);

  return {
    available: Platform.OS === 'ios' && Boolean(product),
    busy,
    isPro,
    message,
    price: product?.displayPrice ?? '$8.99',
    purchase,
    restore,
    manage,
    clearMessage: () => setMessage(null),
  };
}
