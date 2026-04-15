"use client";

import { useState, useEffect } from 'react';

/**
 * Hook que detecta en tiempo real si el navegador tiene conexión a internet.
 * Usa los eventos nativos `online` / `offline` del window.
 * isOnline: true  → hay conexión
 * isOnline: false → sin conexión
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sincronizar al montar por si el navegador ya estaba offline
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
