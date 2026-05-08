import type { CafeSpace, Equipment, EventType, NoiseTolerance } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type BackendPlaceResponse = {
  id: number | null;
  title: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  seatCount: number;
  openinghours?: string | null;
  allowSound?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
  preferedEventTypes?: string[] | null;
  pricingType?: boolean | null;
};

function apiUrl(path: string, params?: Record<string, string>) {
  const url = new URL(
    path,
    API_BASE_URL || "http://local-stage.internal",
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

async function fetchStringList(path: string, params?: Record<string, string>) {
  const response = await fetch(apiUrl(path, params), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  const values = (await response.json()) as string[];
  return Array.from(new Set(values.filter(Boolean))).sort();
}

export function fetchPlaceCities() {
  return fetchStringList("/api/places/regions/cities");
}

export function fetchPlaceDistricts(city: string) {
  return fetchStringList("/api/places/regions/districts", { city });
}

export function fetchPlaceNeighborhoods(city: string, district: string) {
  return fetchStringList("/api/places/regions/neighborhoods", {
    city,
    district,
  });
}

function searchParam(value?: string) {
  return value && value !== "all" ? value : "";
}

function normalizeEventType(value: string): EventType | null {
  const normalized = value.replace(/[\s_-]/g, "").toLowerCase();

  if (
    normalized.includes("performance") ||
    normalized.includes("concert") ||
    normalized.includes("music") ||
    value.includes("공연") ||
    value.includes("음악")
  ) {
    return "performance";
  }

  if (
    normalized.includes("popup") ||
    normalized.includes("pop") ||
    value.includes("팝업") ||
    value.includes("물품")
  ) {
    return "pop-up";
  }

  if (
    normalized.includes("exhibition") ||
    normalized.includes("art") ||
    value.includes("전시") ||
    value.includes("그림") ||
    value.includes("사진")
  ) {
    return "exhibition";
  }

  return null;
}

function normalizeEventTypes(values?: string[] | null): EventType[] {
  const eventTypes = Array.from(
    new Set((values ?? []).map(normalizeEventType).filter(Boolean)),
  ) as EventType[];

  return eventTypes.length ? eventTypes : ["exhibition"];
}

function normalizeNoiseTolerance(value?: string | null): NoiseTolerance {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("high") || value?.includes("높")) return "high";
  if (
    normalized.includes("low") ||
    normalized.includes("false") ||
    normalized.includes("no") ||
    value?.includes("낮") ||
    value?.includes("불가") ||
    value?.includes("조용")
  ) {
    return "low";
  }
  if (normalized.includes("medium") || value?.includes("보통")) return "medium";
  if (value?.includes("가능") || value?.includes("허용")) return "medium";

  return "low";
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function inferEquipment(
  place: BackendPlaceResponse,
  eventTypes: EventType[],
): Equipment[] {
  const description = `${place.description ?? ""} ${place.allowSound ?? ""}`;
  const equipment = new Set<Equipment>();

  if (eventTypes.includes("exhibition")) {
    equipment.add("Display wall");
    equipment.add("Lighting");
  }
  if (eventTypes.includes("performance")) {
    equipment.add("Speaker");
    equipment.add("Microphone");
  }
  if (includesAny(description, ["프로젝터", "projector", "스크린", "영상"])) {
    equipment.add("Projector");
  }
  if (!equipment.size) equipment.add("Lighting");

  return Array.from(equipment);
}

function stableUtilization(id: string) {
  const total = Array.from(id).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return 48 + (total % 34);
}

function fallbackImage(eventTypes: EventType[]) {
  if (eventTypes.includes("performance")) {
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80";
  }
  if (eventTypes.includes("pop-up")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80";
  }
  return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80";
}

export function adaptBackendPlace(place: BackendPlaceResponse): CafeSpace {
  const id = `backend-place-${place.id ?? place.title}`;
  const eventTypes = normalizeEventTypes(place.preferedEventTypes);
  const noiseTolerance = normalizeNoiseTolerance(place.allowSound);
  const description =
    place.description ||
    "백엔드에 등록된 카페 공간입니다. 운영 중인 카페의 일부 공간을 작은 문화 활동에 활용할 수 있습니다.";
  const equipment = inferEquipment(place, eventTypes);
  const hasWallSpace =
    eventTypes.includes("exhibition") ||
    includesAny(description, ["벽", "전시", "갤러리"]);
  const hasCornerSpace =
    eventTypes.includes("pop-up") ||
    includesAny(description, ["코너", "선반", "진열", "팝업"]);

  const image = place.thumbnailUrl || fallbackImage(eventTypes);

  return {
    id,
    name: place.title,
    region: place.address3 || place.address2 || place.address1,
    address: [place.address1, place.address2, place.address3, place.address4]
      .filter(Boolean)
      .join(" "),
    description,
    availableTypes: eventTypes,
    capacity: Math.max(1, place.seatCount),
    seats: Math.max(1, place.seatCount),
    operatingHours: place.openinghours ?? "운영 시간 협의",
    availableTimeSlots: [
      place.openinghours ? `${place.openinghours} 중 협의` : "운영 중 협의",
    ],
    hasWallSpace,
    hasCornerSpace,
    allowsPerformance:
      eventTypes.includes("performance") || noiseTolerance !== "low",
    noiseTolerance,
    equipment,
    priceType: place.pricingType ? "paid" : "free",
    pricePerHour: 0,
    atmosphere:
      noiseTolerance === "low"
        ? "조용한 카페 운영형 문화 공간"
        : "유연하게 협업 가능한 카페 문화 공간",
    image,
    images: [image],
    utilizationRate: stableUtilization(id),
  };
}

export async function fetchPlaces(filters?: {
  address1?: string;
  address2?: string;
  address3?: string;
}) {
  const response = await fetch(
    apiUrl("/api/places/search", {
      address1: searchParam(filters?.address1),
      address2: searchParam(filters?.address2),
      address3: searchParam(filters?.address3),
    }),
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch places: ${response.status}`);
  }

  const places = (await response.json()) as BackendPlaceResponse[];
  return places.map(adaptBackendPlace);
}
