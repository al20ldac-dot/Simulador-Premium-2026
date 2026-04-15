"use client";

import { OfflineOverlay } from "@/components/ui/OfflineOverlay";

export default function OfflinePage() {
  /**
   * Nota: El sistema ahora usa un Overlay Global en layout.tsx.
   * Esta página se mantiene como respaldo si por algún motivo
   * se navega manualmente a /offline, pero el componente OfflineOverlay
   * se encargará de mostrar la misma interfaz.
   */
  return <OfflineOverlay />;
}
