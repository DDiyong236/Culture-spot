import type { EventType, LocalEvent, Space } from "./types";

export const eventTypeLabels: Record<EventType, string> = {
  exhibition: "전시",
  performance: "공연",
  "pop-up": "팝업",
};

export const eventTypes: EventType[] = ["exhibition", "performance", "pop-up"];

export const spaces: Space[] = [
  {
    id: "cafe-yeonnam-window",
    name: "연남 윈도우 카페",
    region: "연남",
    address: "마포구 동교로38길 24",
    description:
      "창가 옆 긴 벽면과 작은 코너가 있는 차분한 동네 카페입니다.",
    eventTypes: ["exhibition", "pop-up"],
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
    atmosphere: "조용한 갤러리형 분위기",
    priceLabel: "협업 가능",
    openLabel: "평일 오후 추천",
    matchScore: 94,
  },
  {
    id: "cafe-mangwon-record",
    name: "망원 레코드 바리스타",
    region: "망원",
    address: "마포구 월드컵로13길 18",
    description:
      "느린 저녁 시간대에 작은 어쿠스틱 공연과 진 팝업을 열 수 있습니다.",
    eventTypes: ["performance", "pop-up"],
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    atmosphere: "음악 친화적인 따뜻한 공간",
    priceLabel: "45,000원 / 시간",
    openLabel: "평일 저녁 추천",
    matchScore: 88,
  },
  {
    id: "cafe-seongsu-brick",
    name: "성수 브릭 테이블",
    region: "성수",
    address: "성동구 성수이로7길 9",
    description:
      "넉넉한 벽면, 이동 가능한 스툴, 프로젝터 환경을 갖춘 작업실형 카페입니다.",
    eventTypes: ["exhibition", "performance", "pop-up"],
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    atmosphere: "개방적인 복합문화 분위기",
    priceLabel: "70,000원 / 시간",
    openLabel: "금요일 저녁 추천",
    matchScore: 91,
  },
  {
    id: "cafe-haebang-poetry",
    name: "해방촌 시의 방",
    region: "해방촌",
    address: "용산구 신흥로 31",
    description:
      "독서 테이블과 부드러운 조명, 일러스트와 시를 걸 수 있는 조용한 벽면이 있습니다.",
    eventTypes: ["exhibition"],
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80",
    atmosphere: "사적인 문학 공간",
    priceLabel: "무료",
    openLabel: "일요일 오전 추천",
    matchScore: 86,
  },
  {
    id: "cafe-ikseon-lantern",
    name: "익선 랜턴 카페",
    region: "익선",
    address: "종로구 수표로28길 12",
    description:
      "한옥 느낌의 마당 코너를 활용해 공예 팝업을 열기 좋은 카페입니다.",
    eventTypes: ["exhibition", "pop-up"],
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
    atmosphere: "느린 공예 친화 분위기",
    priceLabel: "협업 가능",
    openLabel: "일요일 오후 추천",
    matchScore: 82,
  },
];

export const events: LocalEvent[] = [
  {
    id: "event-rain-windows",
    title: "비 온 뒤의 창문",
    creatorName: "한지우",
    cafeName: "연남 윈도우 카페",
    region: "연남",
    eventType: "exhibition",
    dateLabel: "5월 23일",
    timeLabel: "14:00 - 18:00",
    description: "창가 벽면을 따라 조용히 배치되는 사진 전시입니다.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    tags: ["사진", "벽면 전시", "조용한 카페"],
  },
  {
    id: "event-three-songs",
    title: "닫기 전 세 곡",
    creatorName: "박민아",
    cafeName: "망원 레코드 바리스타",
    region: "망원",
    eventType: "performance",
    dateLabel: "5월 29일",
    timeLabel: "19:30 - 20:10",
    description: "부드러운 저녁 영업 시간대에 열리는 작은 어쿠스틱 공연입니다.",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    tags: ["인디", "코너 무대", "저녁"],
  },
  {
    id: "event-small-tables",
    title: "작은 테이블, 큰 기분",
    creatorName: "서다니엘",
    cafeName: "익선 랜턴 카페",
    region: "익선",
    eventType: "pop-up",
    dateLabel: "6월 1일",
    timeLabel: "13:00 - 17:00",
    description: "마당 코너에 놓이는 엽서와 미니 프린트 팝업입니다.",
    image:
      "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?auto=format&fit=crop&w=900&q=80",
    tags: ["일러스트", "굿즈", "한옥 카페"],
  },
  {
    id: "event-pages-11",
    title: "오전 11시의 페이지",
    creatorName: "김소연",
    cafeName: "신촌 스터디 가든",
    region: "신촌",
    eventType: "pop-up",
    dateLabel: "6월 4일",
    timeLabel: "11:00 - 12:00",
    description: "평일 오전에 프로젝터를 활용해 진행되는 짧은 낭독과 대화입니다.",
    image:
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=900&q=80",
    tags: ["시", "낭독", "오전 문화"],
  },
];

export const regions = [
  "전체",
  ...Array.from(new Set(spaces.map((space) => space.region))),
];
