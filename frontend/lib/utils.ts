import clsx, { type ClassValue } from "clsx";
import type {
  CafeSpace,
  Equipment,
  EventType,
  NoiseTolerance,
  PriceType,
  UserRole,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value?: number) {
  if (!value) return "무료";
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPrice(type: PriceType, pricePerHour?: number) {
  if (type === "free") return "무료";
  if (type === "collaboration") return "협업";
  return `${formatCurrency(pricePerHour)} / 시간`;
}

export function eventTypeLabel(type: EventType) {
  const labels: Record<EventType, string> = {
    exhibition: "전시",
    performance: "공연",
    "pop-up": "팝업",
  };

  return labels[type];
}

export function equipmentLabel(equipment: Equipment) {
  const labels: Record<Equipment, string> = {
    Speaker: "스피커",
    Microphone: "마이크",
    Projector: "프로젝터",
    "Display wall": "전시 벽",
    Lighting: "조명",
  };

  return labels[equipment];
}

export function noiseLabel(noise: NoiseTolerance) {
  const labels: Record<NoiseTolerance, string> = {
    low: "낮음",
    medium: "보통",
    high: "높음",
  };

  return labels[noise];
}

export function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    consumer: "소비자",
    creator: "창작자",
    cafeOwner: "카페 주인",
  };

  return labels[role];
}

export function roleHomeLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    consumer: "내 동네 문화",
    creator: "그룹 프로젝트 관리",
    cafeOwner: "카페 운영 화면",
  };

  return labels[role];
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function scoreTone(score: number) {
  if (score >= 85) return "bg-sage text-white";
  if (score >= 70) return "bg-accent text-white";
  return "bg-primary text-white";
}

export function formatOpeningHours(cafe: Pick<CafeSpace, "operatingHours">) {
  return cafe.operatingHours ?? "10:00 - 22:00";
}

export function cafeSizeLabel(cafe: Pick<CafeSpace, "capacity">) {
  if (cafe.capacity <= 22) return "아담한 공간";
  if (cafe.capacity <= 32) return "중간 규모 공간";
  return "넓은 공간";
}

export function baseLikeCount(id: string) {
  return (
    Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0) %
      68 +
    12
  );
}
