import clsx, { type ClassValue } from "clsx";
import type { Equipment, EventType, NoiseTolerance, PriceType } from "@/types";

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
    "book talk": "북토크",
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

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function scoreTone(score: number) {
  if (score >= 85) return "bg-sage text-white";
  if (score >= 70) return "bg-accent text-white";
  return "bg-primary text-white";
}
