"use client";

import dynamic from "next/dynamic";

export type { MapMarker } from "./leaflet-map";

/** Leaflet touches `window`, so it only renders in the browser. */
export const MapView = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-brand-100" />,
});
