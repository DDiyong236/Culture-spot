import type { CafeSpace, CreatorProject, MatchingResult } from "@/types";
import { eventTypeLabel } from "@/lib/utils";

const SCORE_WEIGHTS = {
  region: 20,
  eventType: 20,
  spaceCondition: 20,
  timeSlot: 15,
  budget: 10,
  capacity: 10,
  noise: 5,
} as const;

const conditionCheckers: Record<
  string,
  (cafe: CafeSpace, creator: CreatorProject) => boolean
> = {
  "벽면 공간": (cafe) => cafe.hasWallSpace,
  "wall space": (cafe) => cafe.hasWallSpace,
  "전시 벽": (cafe) => cafe.equipment.includes("Display wall"),
  "display wall": (cafe) => cafe.equipment.includes("Display wall"),
  "코너 공간": (cafe) => cafe.hasCornerSpace,
  "corner space": (cafe) => cafe.hasCornerSpace,
  "프로젝터": (cafe) => cafe.equipment.includes("Projector"),
  projector: (cafe) => cafe.equipment.includes("Projector"),
  "스피커": (cafe) => cafe.equipment.includes("Speaker"),
  speaker: (cafe) => cafe.equipment.includes("Speaker"),
  "마이크": (cafe) => cafe.equipment.includes("Microphone"),
  microphone: (cafe) => cafe.equipment.includes("Microphone"),
  "조명": (cafe) => cafe.equipment.includes("Lighting"),
  lighting: (cafe) => cafe.equipment.includes("Lighting"),
  "조용한 분위기": (cafe) =>
    cafe.noiseTolerance === "low" ||
    cafe.atmosphere.toLowerCase().includes("quiet") ||
    cafe.atmosphere.includes("조용") ||
    cafe.atmosphere.includes("차분"),
  "quiet atmosphere": (cafe) =>
    cafe.noiseTolerance === "low" ||
    cafe.atmosphere.toLowerCase().includes("quiet") ||
    cafe.atmosphere.includes("조용") ||
    cafe.atmosphere.includes("차분"),
  "소음 허용": (cafe) => cafe.noiseTolerance === "medium" || cafe.noiseTolerance === "high",
  "noise allowed": (cafe) => cafe.noiseTolerance === "medium" || cafe.noiseTolerance === "high",
};

const conditionLabels: Record<string, string> = {
  "wall space": "벽면 공간",
  "display wall": "전시 벽",
  "corner space": "코너 공간",
  projector: "프로젝터",
  speaker: "스피커",
  microphone: "마이크",
  lighting: "조명",
  "quiet atmosphere": "조용한 분위기",
  "noise allowed": "소음 허용",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function conditionLabel(condition: string) {
  return conditionLabels[condition] ?? condition;
}

function timeSlotMatches(preferredTime: string, cafeSlots: string[]) {
  const preferred = normalize(preferredTime);
  return cafeSlots.some((slot) => {
    const normalizedSlot = normalize(slot);
    return (
      normalizedSlot === preferred ||
      normalizedSlot.includes(preferred) ||
      preferred.includes(normalizedSlot)
    );
  });
}

function budgetFits(creator: CreatorProject, cafe: CafeSpace) {
  if (cafe.priceType === "free" || cafe.priceType === "collaboration") {
    return { score: SCORE_WEIGHTS.budget, label: "예산이 카페의 협업 방식과 맞음" };
  }

  const price = cafe.pricePerHour ?? 0;
  if (creator.budget >= price) {
    return { score: SCORE_WEIGHTS.budget, label: "예산이 시간당 이용 금액을 충족함" };
  }

  if (creator.budget >= price * 0.7) {
    return { score: 6, label: "예산이 이용 금액에 근접함" };
  }

  return { score: 0, label: "예산이 이 카페 기준보다 낮을 수 있음" };
}

function noiseFits(creator: CreatorProject, cafe: CafeSpace) {
  const conditions = creator.requiredConditions.map(normalize);
  if (conditions.includes("noise allowed") || conditions.includes("소음 허용")) {
    return cafe.noiseTolerance === "medium" || cafe.noiseTolerance === "high";
  }

  if (creator.eventType === "performance") {
    return cafe.allowsPerformance && cafe.noiseTolerance !== "low";
  }

  if (creator.eventType === "pop-up") {
    return cafe.noiseTolerance !== "low" || cafe.availableTypes.includes("pop-up");
  }

  return true;
}

function eventAvailabilityFits(creator: CreatorProject, cafe: CafeSpace) {
  if (!cafe.availableTypes.includes(creator.eventType)) return false;
  if (creator.eventType === "performance") return cafe.allowsPerformance;
  if (creator.eventType === "exhibition") return cafe.hasWallSpace;
  return true;
}

function buildReason(
  creator: CreatorProject,
  cafe: CafeSpace,
  matchedFactors: string[],
) {
  const localFit =
    normalize(creator.preferredRegion) === normalize(cafe.region)
      ? `${cafe.region} 지역에 있고`
      : "창작자가 선호하는 동네 흐름과 가깝고";
  const strongestFactors = matchedFactors.slice(0, 3).join(", ");

  return `이 카페는 ${creator.projectTitle || "해당 프로젝트"}에 잘 맞습니다. ${localFit} ${eventTypeLabel(creator.eventType)} 형식을 지원하며, ${strongestFactors || "작은 문화 활동에 필요한 조건"}을 갖추고 있어 카페 영업을 유지한 채 자연스럽게 운영할 수 있습니다.`;
}

export function calculateMatchingScore(
  creator: CreatorProject,
  cafe: CafeSpace,
): MatchingResult {
  let totalScore = 0;
  const matchedFactors: string[] = [];
  const missingFactors: string[] = [];

  if (normalize(creator.preferredRegion) === normalize(cafe.region)) {
    totalScore += SCORE_WEIGHTS.region;
    matchedFactors.push("희망 지역 일치");
  } else {
    missingFactors.push("희망 지역과 다름");
  }

  if (eventAvailabilityFits(creator, cafe)) {
    totalScore += SCORE_WEIGHTS.eventType;
    matchedFactors.push(`${eventTypeLabel(creator.eventType)} 지원`);
  } else {
    missingFactors.push(`${eventTypeLabel(creator.eventType)} 지원 부족`);
  }

  const requiredConditions = creator.requiredConditions.map(normalize);
  const conditionMatches = requiredConditions.filter((condition) => {
    const checker = conditionCheckers[condition];
    return checker ? checker(cafe, creator) : false;
  });

  if (requiredConditions.length === 0) {
    totalScore += SCORE_WEIGHTS.spaceCondition;
    matchedFactors.push("공간 조건이 유연함");
  } else {
    const conditionScore = Math.round(
      (conditionMatches.length / requiredConditions.length) *
        SCORE_WEIGHTS.spaceCondition,
    );
    totalScore += conditionScore;
    conditionMatches.forEach((condition) =>
      matchedFactors.push(conditionLabel(condition)),
    );
    requiredConditions
      .filter((condition) => !conditionMatches.includes(condition))
      .forEach((condition) => missingFactors.push(conditionLabel(condition)));
  }

  if (timeSlotMatches(creator.preferredTime, cafe.availableTimeSlots)) {
    totalScore += SCORE_WEIGHTS.timeSlot;
    matchedFactors.push("희망 시간대 일치");
  } else {
    missingFactors.push("희망 시간대 불일치");
  }

  const budgetResult = budgetFits(creator, cafe);
  totalScore += budgetResult.score;
  if (budgetResult.score > 0) {
    matchedFactors.push(budgetResult.label);
  } else {
    missingFactors.push(budgetResult.label);
  }

  if (cafe.capacity >= creator.expectedAudience) {
    totalScore += SCORE_WEIGHTS.capacity;
    matchedFactors.push("예상 관객 규모 수용 가능");
  } else if (cafe.capacity >= creator.expectedAudience * 0.8) {
    totalScore += 5;
    matchedFactors.push("수용 인원이 예상 규모에 근접함");
  } else {
    missingFactors.push("수용 인원이 부족할 수 있음");
  }

  if (noiseFits(creator, cafe)) {
    totalScore += SCORE_WEIGHTS.noise;
    matchedFactors.push("소음 허용 수준 적합");
  } else {
    missingFactors.push("소음 허용 수준");
  }

  return {
    cafe,
    totalScore: Math.min(totalScore, 100),
    matchedFactors,
    missingFactors,
    recommendationReason: buildReason(creator, cafe, matchedFactors),
  };
}

export function rankCafeMatches(
  creator: CreatorProject,
  cafes: CafeSpace[],
  limit = 3,
) {
  return cafes
    .map((cafe) => calculateMatchingScore(creator, cafe))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
}
