import Link from "next/link";
import {
  Brush,
  Coffee,
  MapPin,
  Music,
  ScanLine,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import Hero from "@/components/Hero";
import CafeCard from "@/components/CafeCard";
import EventCard from "@/components/EventCard";
import { cafeSpaces, creators, events } from "@/data/mock";

const flowSteps = [
  {
    title: "카페가 쓰이지 않던 공간을 등록합니다",
    body: "벽면, 코너, 선반, 한적한 시간대를 등록해도 카페 영업은 평소처럼 이어집니다.",
    icon: Store,
  },
  {
    title: "창작자가 작은 프로젝트로 신청합니다",
    body: "전시, 공연, 팝업, 토크가 공간 조건, 예산, 시간대, 분위기에 따라 매칭됩니다.",
    icon: Brush,
  },
  {
    title: "이웃은 일상 속 문화를 발견합니다",
    body: "주민은 평소 들르던 카페 안에서 가까운 문화 경험을 자연스럽게 만납니다.",
    icon: MapPin,
  },
];

const userCards = [
  {
    title: "창작자를 위해",
    icon: Sparkles,
    points: [
      "부담 적은 동네 공간 찾기",
      "실제 지역 관객 만나기",
      "작업과 활동 알리기",
    ],
  },
  {
    title: "카페를 위해",
    icon: Coffee,
    points: [
      "영업을 멈추지 않고 유휴 공간 활용",
      "한적한 시간대 방문 증가",
      "동네 문화 브랜드 만들기",
    ],
  },
  {
    title: "이웃을 위해",
    icon: Users,
    points: [
      "가까운 전시와 공연 발견",
      "부담 없이 문화 경험하기",
      "지역 창작자 응원하기",
    ],
  },
];

export default function HomePage() {
  const featuredEvents = events.slice(0, 3).map((event) => ({
    event,
    cafe: cafeSpaces.find((cafe) => cafe.id === event.cafeId)!,
    creator: creators.find((creator) => creator.id === event.creatorId)!,
  }));

  return (
    <>
      <Hero />

      <section className="surface-grid border-b border-line py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-accent">이용 흐름</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">
              카페는 카페로 남고, 벽은 작은 갤러리가 됩니다.
            </h2>
            <p className="mt-3 text-base leading-7 text-ink/72">
              Local Stage는 전체 공간 대관 플랫폼이 아니라, 운영 중인 동네
              카페 위에 더해지는 문화 매칭 레이어입니다.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-lg border border-line bg-white p-5 shadow-soft"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-background text-primary">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold text-accent">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink/70">
                    {step.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {userCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="rounded-lg border border-line bg-white p-5 shadow-soft"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-ink">
                    {card.title}
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/72">
                    {card.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-accent">
                추천 공간
              </p>
              <h2 className="mt-2 text-3xl font-bold text-ink">
                동네 분위기와 잘 맞는 작은 문화 표면
              </h2>
            </div>
            <Link
              href="/spaces"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
            >
              <MapPin size={18} aria-hidden="true" />
              공간 둘러보기
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {cafeSpaces.slice(0, 3).map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} compact />
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-accent">
                동네 이벤트
              </p>
              <h2 className="mt-2 text-3xl font-bold text-ink">
                일상적인 카페 방문 사이에 놓인 문화
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-primary">
              <ScanLine size={17} aria-hidden="true" />
              카페 현장 QR 프로필
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredEvents.map(({ event, cafe, creator }) => (
              <EventCard
                key={event.id}
                event={event}
                cafe={cafe}
                creator={creator}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-primary py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/78">
              <Music size={17} aria-hidden="true" />
              MVP 핵심 흐름
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              카페가 공간을 등록하고, 창작자가 신청하면, 주민은 동네 이벤트를 발견합니다.
            </h2>
          </div>
          <Link
            href="/creators"
            className="focus-ring inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-accent/90"
          >
            창작자 매칭 체험하기
          </Link>
        </div>
      </section>
    </>
  );
}
