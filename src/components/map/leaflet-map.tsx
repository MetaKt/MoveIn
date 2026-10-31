"use client";

import L from "leaflet";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { CHULA } from "@/lib/reference";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  kind: "area" | "listing" | "station" | "campus";
  label: string;
  sub?: string;
  color?: string;
  active?: boolean;
  onClick?: () => void;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function icon(m: MapMarker) {
  const base = "font-family:inherit;white-space:nowrap;transform:translate(-50%,-100%);display:inline-block;";
  switch (m.kind) {
    case "campus":
      return L.divIcon({
        className: "",
        iconSize: [0, 0],
        html: `<div style="${base}background:#ec4899;color:#fff;padding:6px 10px;border-radius:12px;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(236,72,153,.35)">🎓 ${esc(m.label)}</div>`,
      });
    case "area":
      return L.divIcon({
        className: "",
        iconSize: [0, 0],
        html: `<div style="${base}background:${m.active ? "#0f66d0" : "#fff"};color:${m.active ? "#fff" : "#0d52a8"};padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px;border:2px solid #0f66d0;box-shadow:0 4px 12px rgba(15,102,208,.25);cursor:pointer">${esc(m.label)}${m.sub ? `<span style="font-weight:500;opacity:.8"> · ${esc(m.sub)}</span>` : ""}</div>`,
      });
    case "listing":
      return L.divIcon({
        className: "",
        iconSize: [0, 0],
        html: `<div style="${base}background:${m.active ? "#0f1b2d" : "#fff"};color:${m.active ? "#fff" : "#0f1b2d"};padding:4px 8px;border-radius:999px;font-weight:700;font-size:12px;box-shadow:0 2px 8px rgba(15,27,45,.25);cursor:pointer">${esc(m.label)}</div>`,
      });
    case "station":
      return L.divIcon({
        className: "",
        iconSize: [0, 0],
        html: `<div style="transform:translate(-50%,-50%);width:16px;height:16px;border-radius:999px;background:#fff;border:4px solid ${m.color ?? "#0f66d0"};box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer"></div>`,
      });
  }
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 0.6 });
  }, [lat, lng, zoom, map]);
  return null;
}

// OpenStreetMap's free tiles need no key but are meant for light use. For launch traffic, set
// NEXT_PUBLIC_MAP_TILE_URL (and attribution) to a hosted provider such as MapTiler or Stadia Maps.
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function LeafletMap({
  markers,
  center = [CHULA.lat, CHULA.lng],
  zoom = 14,
  className = "h-full w-full",
  showCampus = true,
}: {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  showCampus?: boolean;
}) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className={className}>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} maxZoom={19} />
      <FlyTo center={center} zoom={zoom} />
      {showCampus && (
        <>
          <Circle center={[CHULA.lat, CHULA.lng]} radius={550} pathOptions={{ color: "#ec4899", fillColor: "#f9a8d4", fillOpacity: 0.25, weight: 1.5 }} />
          <Marker position={[CHULA.lat, CHULA.lng]} icon={icon({ id: "chula", lat: 0, lng: 0, kind: "campus", label: "Chula" })} />
        </>
      )}
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={icon(m)} eventHandlers={m.onClick ? { click: m.onClick } : undefined} zIndexOffset={m.active ? 1000 : 0}>
          {m.kind === "station" && (
            <Tooltip direction="top" offset={[0, -8]}>
              <strong>{m.label}</strong>
              {m.sub ? <div>{m.sub}</div> : null}
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
