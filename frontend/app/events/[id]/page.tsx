import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Heart,
  MapPin,
  QrCode,
  Ticket,
  UserRound,
} from "lucide-react";
import { cafeSpaces, creators, events } from "@/data/mock";
import { equipmentLabel, eventTypeLabel } from "@/lib/utils";

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const event = events.find((item) => item.id === id);

  if (!event) {
    notFound();
  }

  const cafe = cafeSpaces.find((item) => item.id === event.cafeId);
  const creator = creators.find((item) => item.id === event.creatorId);

  if (!cafe || !creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-accent">
              {eventTypeLabel(event.eventType)}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight text-ink sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-ink/72">
              {event.description}
            </p>
            <div className="mt-6 grid gap-3 text-sm text-ink/72 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <UserRound size={17} className="text-sage" aria-hidden="true" />
                {creator.name} · {creator.genre}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-sage"
                  aria-hidden="true"
                />
                {event.date} · {event.time}
              </p>
              <p className="flex items-center gap-2 sm:col-span-2">
                <MapPin size={17} className="text-sage" aria-hidden="true" />
                {cafe.name}, {cafe.address}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white">
                <Heart size={18} aria-hidden="true" />
                관심 저장
              </button>
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-accent/90">
                <Ticket size={18} aria-hidden="true" />
                예약하기
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-line shadow-warm">
            <img
              src={cafe.image}
              alt={`${cafe.name} 내부 공간`}
              className="h-full min-h-[340px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.7fr_0.3fr] lg:px-8">
          <div className="space-y-6">
            <article className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-bold text-ink">
                작품과 공연 소개
              </h2>
              <p className="mt-3 text-base leading-8 text-ink/72">
                {creator.introduction}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="badge">
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-bold text-ink">
                이 이벤트가 이 카페와 잘 맞는 이유
              </h2>
              <p className="mt-3 text-base leading-8 text-ink/72">
                {event.recommendationReason}
              </p>
              <p className="mt-3 text-base leading-8 text-ink/72">
                이 이벤트는 카페의 일부 공간만 활용합니다. 주민은 평소처럼
                주문하고 앉고 오가면서 창작자의 작업을 자연스럽게 발견할 수
                있습니다.
              </p>
            </article>

            <article className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-bold text-ink">카페 정보</h2>
              <p className="mt-3 text-base leading-8 text-ink/72">
                {cafe.description}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-ink/72 sm:grid-cols-2">
                <p>수용 인원: {cafe.capacity}명</p>
                <p>가능 시간대: {cafe.availableTimeSlots.join(", ")}</p>
                <p>분위기: {cafe.atmosphere}</p>
                <p>장비: {cafe.equipment.map(equipmentLabel).join(", ")}</p>
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 text-primary">
                <QrCode size={20} aria-hidden="true" />
                <h2 className="text-lg font-bold">QR 코드 안내</h2>
              </div>
              <div className="mt-5 grid aspect-square grid-cols-5 gap-1 rounded-lg border border-line bg-background p-4">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      [0, 1, 3, 4, 5, 10, 15, 20, 21, 23, 24, 7, 12, 17].includes(
                        index,
                      )
                        ? "rounded-sm bg-primary"
                        : "rounded-sm bg-white"
                    }
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/72">
                방문자는 카페에 비치된 QR 코드를 스캔해 창작자 프로필,
                작품 설명, 구매 링크, 후원 페이지를 확인할 수 있습니다.
              </p>
            </article>

            <article className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="text-lg font-bold text-ink">창작자</h2>
              <p className="mt-2 font-semibold text-primary">{creator.name}</p>
              <p className="mt-2 text-sm leading-6 text-ink/72">
                {creator.genre} · {creator.projectTitle}
              </p>
              <Link
                href={creator.portfolioUrl}
                className="focus-ring mt-4 inline-flex w-full items-center justify-center rounded-lg border border-line px-4 py-2.5 text-sm font-bold text-primary transition hover:border-primary"
              >
                포트폴리오 보기
              </Link>
            </article>
          </aside>
        </div>
      </section>
    </div>
  );
}
