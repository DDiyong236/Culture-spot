export type EventType = "exhibition" | "performance" | "pop-up";

export type Space = {
  id: string;
  name: string;
  region: string;
  address: string;
  description: string;
  eventTypes: EventType[];
  image: string;
  atmosphere: string;
  priceLabel: string;
  openLabel: string;
  matchScore: number;
};

export type LocalEvent = {
  id: string;
  title: string;
  creatorName: string;
  cafeName: string;
  region: string;
  eventType: EventType;
  dateLabel: string;
  timeLabel: string;
  description: string;
  image: string;
  tags: string[];
};
