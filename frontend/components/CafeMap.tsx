"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation, Users, Volume2 } from "lucide-react";
import { cafeSpaces } from "@/data/mock";
import {
  type CafeCoordinate,
  getCafeCoordinate,
  koreaMapCenter,
} from "@/lib/cafeMapCoordinates";
import { CAFE_CARD_STORAGE_KEY } from "@/lib/storageKeys";
import { cn, eventTypeLabel, formatPrice, noiseLabel } from "@/lib/utils";
import type { CafeSpace } from "@/types";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type CafeMapItem = CafeSpace & {
  coordinate: CafeCoordinate;
};

type LeafletModule = typeof import("leaflet");

const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function dedupeCafes(cafes: CafeSpace[]) {
  const seen = new Set<string>();
  return cafes.filter((cafe) => {
    if (seen.has(cafe.id)) return false;
    seen.add(cafe.id);
    return true;
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPopupContent(cafe: CafeMapItem) {
  return `
    <div style="min-width:160px;color:#5f493f;font-size:13px;line-height:1.45;">
      <strong style="display:block;color:#3f2f28;font-size:14px;">${escapeHtml(
        cafe.name,
      )}</strong>
      <span>${escapeHtml(cafe.region)} · ${escapeHtml(
        formatPrice(cafe.priceType, cafe.pricePerHour),
      )}</span>
      <span style="display:block;margin-top:4px;color:rgba(47,39,35,0.7);">${escapeHtml(
        cafe.address,
      )}</span>
    </div>
  `;
}

function createMarkerIcon(leaflet: LeafletModule, selected: boolean) {
  const size = selected ? 28 : 18;

  return leaflet.divIcon({
    className: "",
    html: `<span style="
      display:block;
      width:${size}px;
      height:${size}px;
      border-radius:9999px;
      border:3px solid #fff;
      background:${selected ? "#5f493f" : "#f37338"};
      box-shadow:0 10px 24px rgba(47,39,35,0.2);
    "></span>`,
    iconAnchor: [size / 2, size / 2],
    iconSize: [size, size],
  });
}

export default function CafeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const fittedCafeCountRef = useRef(0);
  const shouldFocusSelectedCafeRef = useRef(false);

  const [registeredCafes, setRegisteredCafes] = useState<CafeSpace[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState(cafeSpaces[0]?.id ?? "");
  const [isMapReady, setIsMapReady] = useState(false);

  const selectCafe = useCallback((id: string) => {
    shouldFocusSelectedCafeRef.current = true;
    setSelectedCafeId(id);
  }, []);

  useEffect(() => {
    setRegisteredCafes(readStorage<CafeSpace[]>(CAFE_CARD_STORAGE_KEY, []));
  }, []);

  const cafes = useMemo<CafeMapItem[]>(() => {
    return dedupeCafes([...registeredCafes, ...cafeSpaces]).map((cafe) => ({
      ...cafe,
      coordinate: getCafeCoordinate(cafe),
    }));
  }, [registeredCafes]);

  const selectedCafe = useMemo(() => {
    return cafes.find((cafe) => cafe.id === selectedCafeId) ?? cafes[0];
  }, [cafes, selectedCafeId]);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((leaflet) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      leafletRef.current = leaflet;
      const map = leaflet
        .map(mapRef.current, {
          zoomControl: false,
          scrollWheelZoom: true,
        })
        .setView([koreaMapCenter.lat, koreaMapCenter.lng], 7);

      leaflet.control.zoom({ position: "bottomright" }).addTo(map);
      leaflet
        .tileLayer(TILE_LAYER_URL, {
          attribution: TILE_LAYER_ATTRIBUTION,
          maxZoom: 19,
        })
        .addTo(map);

      markerLayerRef.current = leaflet.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      cancelled = true;
      markerLayerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      leafletRef.current = null;
      fittedCafeCountRef.current = 0;
    };
  }, []);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;

    if (!leaflet || !map || !markerLayer) return;

    markerLayer.clearLayers();

    cafes.forEach((cafe) => {
      const selected = cafe.id === selectedCafe?.id;
      const marker = leaflet
        .marker([cafe.coordinate.lat, cafe.coordinate.lng], {
          icon: createMarkerIcon(leaflet, selected),
          title: cafe.name,
        })
        .bindPopup(getPopupContent(cafe));

      marker.on("click", () => {
        selectCafe(cafe.id);
      });
      marker.addTo(markerLayer);
    });

    if (cafes.length && fittedCafeCountRef.current !== cafes.length) {
      const bounds = leaflet.latLngBounds(
        cafes.map((cafe) => [cafe.coordinate.lat, cafe.coordinate.lng]),
      );
      map.fitBounds(bounds, {
        maxZoom: 13,
        paddingTopLeft: [420, 32],
        paddingBottomRight: [32, 32],
      });
      fittedCafeCountRef.current = cafes.length;
    }
  }, [cafes, isMapReady, selectCafe, selectedCafe]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCafe || !isMapReady) return;
    if (!shouldFocusSelectedCafeRef.current) return;

    shouldFocusSelectedCafeRef.current = false;

    map.flyTo([selectedCafe.coordinate.lat, selectedCafe.coordinate.lng], 14, {
      duration: 0.6,
    });
  }, [isMapReady, selectedCafe]);

  return (
    <section className="relative h-[calc(100svh-4.5rem)] min-h-[560px] overflow-hidden bg-[#dfe7dc]">
      <div
        ref={mapRef}
        className="absolute inset-0 z-0"
        aria-label="OpenStreetMap 카페 지도"
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-background/10" />
      <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-xs font-bold text-primary shadow-soft">
        OpenStreetMap
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/10 to-transparent" />

      <aside className="absolute inset-x-3 bottom-3 z-20 flex max-h-[46vh] flex-col overflow-hidden rounded-lg border border-line/80 bg-background/95 shadow-soft backdrop-blur md:bottom-4 md:left-4 md:right-auto md:top-4 md:max-h-none md:w-[24rem]">
        <div className="border-b border-line px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-accent">공간 지도</p>
              <h1 className="mt-1 text-xl font-bold text-ink">Local Stage</h1>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
              {cafes.length}곳
            </span>
          </div>

          {selectedCafe ? (
            <div className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-primary shadow-sm">
              <p className="font-bold">{selectedCafe.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-primary/70">
                <Navigation size={13} aria-hidden="true" />
                {selectedCafe.region} ·{" "}
                {formatPrice(selectedCafe.priceType, selectedCafe.pricePerHour)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {cafes.map((cafe) => {
            const selected = cafe.id === selectedCafe?.id;

            return (
              <button
                key={cafe.id}
                type="button"
                onClick={() => selectCafe(cafe.id)}
                className={cn(
                  "focus-ring w-full rounded-lg border bg-white p-3 text-left shadow-sm transition",
                  selected
                    ? "border-accent shadow-[0_0_0_3px_rgba(243,115,56,0.18)]"
                    : "border-line hover:border-accent",
                )}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-primary">
                    {cafe.region}
                  </span>
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-bold text-primary/75">
                    {formatPrice(cafe.priceType, cafe.pricePerHour)}
                  </span>
                </span>
                <span className="mt-2 block text-base font-bold text-ink">
                  {cafe.name}
                </span>
                <span className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-ink/65">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-sage" />
                  {cafe.address}
                </span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {cafe.availableTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full border border-line bg-background px-2 py-1 text-xs font-semibold text-primary"
                    >
                      {eventTypeLabel(type)}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-full border border-line bg-background px-2 py-1 text-xs font-semibold text-primary">
                    <Users size={12} aria-hidden="true" />
                    {cafe.capacity}명
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-line bg-background px-2 py-1 text-xs font-semibold text-primary">
                    <Volume2 size={12} aria-hidden="true" />
                    {noiseLabel(cafe.noiseTolerance)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
