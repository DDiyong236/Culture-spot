import type { CafeSpace } from "@/types";

export type CafeCoordinate = {
  lat: number;
  lng: number;
};

export const koreaMapCenter: CafeCoordinate = {
  lat: 36.45,
  lng: 127.85,
};

const cafeCoordinateById: Record<string, CafeCoordinate> = {
  "cafe-yeonnam-window": { lat: 37.5625, lng: 126.9237 },
  "cafe-mangwon-record": { lat: 37.5569, lng: 126.9046 },
  "cafe-seongsu-brick": { lat: 37.5446, lng: 127.0559 },
  "cafe-haebang-poetry": { lat: 37.5421, lng: 126.9874 },
  "cafe-ikseon-lantern": { lat: 37.5734, lng: 126.9898 },
  "cafe-euljiro-print": { lat: 37.5662, lng: 126.9932 },
  "cafe-sinchon-study": { lat: 37.5598, lng: 126.9379 },
  "cafe-gyeongridan-rooftop": { lat: 37.5382, lng: 126.9872 },
  "cafe-busan-gwangan-film": { lat: 35.1532, lng: 129.1187 },
  "cafe-jeju-aewol-wind": { lat: 33.4634, lng: 126.3096 },
  "cafe-daegu-sound-cup": { lat: 35.8684, lng: 128.5961 },
  "cafe-gwangju-yangnim-art": { lat: 35.1425, lng: 126.9137 },
  "cafe-daejeon-daeheung-desk": { lat: 36.3261, lng: 127.4261 },
  "cafe-incheon-openport": { lat: 37.473, lng: 126.6216 },
  "cafe-suwon-haenggung-corner": { lat: 37.2829, lng: 127.0141 },
  "cafe-gangneung-gyodong-brewing": { lat: 37.7652, lng: 128.8767 },
};

const regionCoordinateByName: Record<string, CafeCoordinate> = {
  연남: { lat: 37.5625, lng: 126.9237 },
  망원: { lat: 37.5569, lng: 126.9046 },
  성수: { lat: 37.5446, lng: 127.0559 },
  해방촌: { lat: 37.5421, lng: 126.9874 },
  익선: { lat: 37.5734, lng: 126.9898 },
  을지로: { lat: 37.5662, lng: 126.9932 },
  신촌: { lat: 37.5598, lng: 126.9379 },
  경리단: { lat: 37.5382, lng: 126.9872 },
  광안리: { lat: 35.1532, lng: 129.1187 },
  애월: { lat: 33.4634, lng: 126.3096 },
  동성로: { lat: 35.8684, lng: 128.5961 },
  양림동: { lat: 35.1425, lng: 126.9137 },
  대흥동: { lat: 36.3261, lng: 127.4261 },
  개항로: { lat: 37.473, lng: 126.6216 },
  행궁동: { lat: 37.2829, lng: 127.0141 },
  교동: { lat: 37.7652, lng: 128.8767 },
};

const addressCoordinateHints: Array<[string, CafeCoordinate]> = [
  ["부산", { lat: 35.1532, lng: 129.1187 }],
  ["제주", { lat: 33.4634, lng: 126.3096 }],
  ["대구", { lat: 35.8684, lng: 128.5961 }],
  ["광주", { lat: 35.1425, lng: 126.9137 }],
  ["대전", { lat: 36.3261, lng: 127.4261 }],
  ["인천", { lat: 37.473, lng: 126.6216 }],
  ["수원", { lat: 37.2829, lng: 127.0141 }],
  ["강릉", { lat: 37.7652, lng: 128.8767 }],
  ["서울", { lat: 37.5665, lng: 126.978 }],
];

export function getCafeCoordinate(
  cafe: Pick<CafeSpace, "id" | "region" | "address">,
): CafeCoordinate {
  const directCoordinate = cafeCoordinateById[cafe.id];
  if (directCoordinate) return directCoordinate;

  const regionCoordinate = regionCoordinateByName[cafe.region];
  if (regionCoordinate) return regionCoordinate;

  const addressHint = addressCoordinateHints.find(([keyword]) =>
    cafe.address.includes(keyword),
  );

  return addressHint?.[1] ?? koreaMapCenter;
}
