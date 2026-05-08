export type EventType = "exhibition" | "performance" | "pop-up" | "book talk";

export type NoiseTolerance = "low" | "medium" | "high";

export type PriceType = "free" | "paid" | "collaboration";

export type Equipment =
  | "Speaker"
  | "Microphone"
  | "Projector"
  | "Display wall"
  | "Lighting";

export type CafeSpace = {
  id: string;
  name: string;
  region: string;
  address: string;
  description: string;
  availableTypes: EventType[];
  capacity: number;
  seats: number;
  availableTimeSlots: string[];
  hasWallSpace: boolean;
  hasCornerSpace: boolean;
  allowsPerformance: boolean;
  noiseTolerance: NoiseTolerance;
  equipment: Equipment[];
  priceType: PriceType;
  pricePerHour?: number;
  atmosphere: string;
  image: string;
  utilizationRate: number;
};

export type CreatorProject = {
  id: string;
  name: string;
  genre: string;
  projectTitle: string;
  eventType: EventType;
  requiredConditions: string[];
  expectedAudience: number;
  preferredRegion: string;
  budget: number;
  preferredTime: string;
  introduction: string;
  portfolioUrl: string;
};

export type LocalEvent = {
  id: string;
  title: string;
  creatorId: string;
  cafeId: string;
  eventType: EventType;
  date: string;
  time: string;
  description: string;
  recommendationReason: string;
  tags: string[];
};

export type MatchingResult = {
  cafe: CafeSpace;
  totalScore: number;
  matchedFactors: string[];
  missingFactors: string[];
  recommendationReason: string;
};

export type FilterState = {
  region: string;
  exhibition: boolean;
  performance: boolean;
  wall: boolean;
  noise: boolean;
  projector: boolean;
  quiet: boolean;
  priceType: "all" | PriceType;
  capacity: number;
};
