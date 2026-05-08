"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type MapStatus = "loading" | "ready" | "missing-key" | "error";

type CafeMapItem = CafeSpace & {
  coordinate: CafeCoordinate;
};

type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

type KakaoMapInstance = {
  panTo(position: KakaoLatLng): void;
  relayout(): void;
};

type KakaoMarker = {
  setMap(map: KakaoMapInstance | null): void;
};

type KakaoInfoWindow = {
  setContent(content: string): void;
  open(map: KakaoMapInstance, marker: KakaoMarker): void;
};

type KakaoMaps = {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  Marker: new (options: {
    map: KakaoMapInstance;
    position: KakaoLatLng;
    title: string;
  }) => KakaoMarker;
  InfoWindow: new (options: { content: string; removable?: boolean }) => KakaoInfoWindow;
  event: {
    addListener(target: unknown, type: string, handler: () => void): void;
  };
};

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMaps;
    };
  }
}

const KAKAO_MAP_SCRIPT_ID = "kakao-map-sdk";
const KOREA_FALLBACK_BOUNDS = {
  minLat: 33.05,
  maxLat: 38.65,
  minLng: 125.8,
  maxLng: 130.25,
};

function loadKakaoMapSdk(appKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(resolve);
      return;
    }

    const existingScript = document.getElementById(
      KAKAO_MAP_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK did not initialize."));
        return;
      }
      window.kakao.maps.load(resolve);
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Kakao Maps SDK.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      appKey,
    )}&autoload=false`;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Kakao Maps SDK.")),
      { once: true },
    );

    document.head.appendChild(script);
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

function getInfoWindowContent(cafe: CafeMapItem) {
  return `
    <div style="padding:10px 12px;color:#5f493f;font-size:13px;line-height:1.45;white-space:nowrap;">
      <strong style="display:block;color:#3f2f28;font-size:14px;">${escapeHtml(
        cafe.name,
      )}</strong>
      <span>${escapeHtml(cafe.region)} · ${escapeHtml(
        formatPrice(cafe.priceType, cafe.pricePerHour),
      )}</span>
    </div>
  `;
}

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

function getFallbackMarkerPosition(coordinate: CafeCoordinate) {
  const left =
    ((coordinate.lng - KOREA_FALLBACK_BOUNDS.minLng) /
      (KOREA_FALLBACK_BOUNDS.maxLng - KOREA_FALLBACK_BOUNDS.minLng)) *
    100;
  const top =
    (1 -
      (coordinate.lat - KOREA_FALLBACK_BOUNDS.minLat) /
        (KOREA_FALLBACK_BOUNDS.maxLat - KOREA_FALLBACK_BOUNDS.minLat)) *
    100;

  return {
    left: `${Math.min(Math.max(left, 4), 96)}%`,
    top: `${Math.min(Math.max(top, 4), 96)}%`,
  };
}

function FallbackMapLayer({
  cafes,
  selectedCafeId,
  status,
  onSelect,
}: {
  cafes: CafeMapItem[];
  selectedCafeId: string;
  status: MapStatus;
  onSelect: (id: string) => void;
}) {
  const statusLabel =
    status === "missing-key"
      ? "NEXT_PUBLIC_KAKAO_MAP_APP_KEY 필요"
      : status === "error"
        ? "지도를 불러오지 못했습니다"
        : "지도 불러오는 중";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#dfe7dc]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(88,121,106,0.14)_1px,transparent_1px),linear-gradient(rgba(88,121,106,0.14)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(103,142,120,0.18)_0_18%,transparent_18%_42%,rgba(86,130,151,0.16)_42%_56%,transparent_56%_100%)]" />
      <div className="absolute right-4 top-4 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-xs font-bold text-primary shadow-soft">
        {statusLabel}
      </div>

      {cafes.map((cafe) => {
        const selected = cafe.id === selectedCafeId;

        return (
          <button
            key={cafe.id}
            type="button"
            aria-label={`${cafe.name} 위치 보기`}
            onClick={() => onSelect(cafe.id)}
            className={cn(
              "focus-ring absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-soft transition",
              selected && "size-6 bg-primary",
            )}
            style={getFallbackMarkerPosition(cafe.coordinate)}
          />
        );
      })}
    </div>
  );
}

export default function CafeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const markerByIdRef = useRef<Record<string, KakaoMarker>>({});
  const infoWindowRef = useRef<KakaoInfoWindow | null>(null);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  const [registeredCafes, setRegisteredCafes] = useState<CafeSpace[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState(cafeSpaces[0]?.id ?? "");
  const [status, setStatus] = useState<MapStatus>(
    appKey ? "loading" : "missing-key",
  );

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
    if (!appKey) {
      setStatus("missing-key");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    loadKakaoMapSdk(appKey)
      .then(() => {
        const kakaoMaps = window.kakao?.maps;
        if (!kakaoMaps || !mapRef.current || cancelled) return;

        const map = new kakaoMaps.Map(mapRef.current, {
          center: new kakaoMaps.LatLng(koreaMapCenter.lat, koreaMapCenter.lng),
          level: 13,
        });
        const nextMarkers: KakaoMarker[] = [];
        const nextMarkerById: Record<string, KakaoMarker> = {};
        const infoWindow = new kakaoMaps.InfoWindow({
          content: "",
          removable: false,
        });

        cafes.forEach((cafe) => {
          const position = new kakaoMaps.LatLng(
            cafe.coordinate.lat,
            cafe.coordinate.lng,
          );
          const marker = new kakaoMaps.Marker({
            map,
            position,
            title: cafe.name,
          });

          kakaoMaps.event.addListener(marker, "click", () => {
            setSelectedCafeId(cafe.id);
            infoWindow.setContent(getInfoWindowContent(cafe));
            infoWindow.open(map, marker);
            map.panTo(position);
          });

          nextMarkers.push(marker);
          nextMarkerById[cafe.id] = marker;
        });

        mapInstanceRef.current = map;
        markersRef.current = nextMarkers;
        markerByIdRef.current = nextMarkerById;
        infoWindowRef.current = infoWindow;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      markerByIdRef.current = {};
      mapInstanceRef.current = null;
      infoWindowRef.current = null;
    };
  }, [appKey, cafes]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const kakaoMaps = window.kakao?.maps;
    const marker = markerByIdRef.current[selectedCafe?.id ?? ""];

    if (!map || !kakaoMaps || !selectedCafe || !marker) return;

    const position = new kakaoMaps.LatLng(
      selectedCafe.coordinate.lat,
      selectedCafe.coordinate.lng,
    );
    infoWindowRef.current?.setContent(getInfoWindowContent(selectedCafe));
    infoWindowRef.current?.open(map, marker);
    map.panTo(position);
  }, [selectedCafe, status]);

  useEffect(() => {
    const handleResize = () => mapInstanceRef.current?.relayout();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative h-[calc(100svh-4.5rem)] min-h-[560px] overflow-hidden bg-[#dfe7dc]">
      <div ref={mapRef} className="absolute inset-0" aria-label="카페 지도" />

      {status !== "ready" ? (
        <FallbackMapLayer
          cafes={cafes}
          selectedCafeId={selectedCafe?.id ?? selectedCafeId}
          status={status}
          onSelect={setSelectedCafeId}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent" />

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
                onClick={() => setSelectedCafeId(cafe.id)}
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
