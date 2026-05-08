"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ClipboardList,
  Coffee,
  FileText,
  Heart,
  MapPin,
  MessageSquareText,
  Palette,
  Star,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import StatCard from "@/components/StatCard";
import { cafeSpaces, creators, events } from "@/data/mock";
import {
  CAFE_APPLICATION_STORAGE_KEY,
  GROUP_CARD_STORAGE_KEY,
} from "@/lib/storageKeys";
import { eventTypeLabel, roleLabel } from "@/lib/utils";
import type { CreatorProject } from "@/types";

type CafeApplication = {
  id: string;
  cafeId: string;
  cafeName: string;
  groupId: string;
  groupName: string;
  projectTitle: string;
  createdAt: string;
};

type CollaborationPlace = {
  cafeId: string;
  cafeName: string;
  count: number;
  projectTitles: string[];
  lastAppliedAt: string;
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 미기록";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function favoriteTitle(key: string) {
  const [type, id] = key.split(":");
  if (type === "cafe") {
    return cafeSpaces.find((cafe) => cafe.id === id)?.name ?? "알 수 없는 카페";
  }
  return creators.find((creator) => creator.id === id)?.name ?? "알 수 없는 아티스트";
}

function ConsumerDashboard() {
  const { user, favorites, reviews } = useAuth();
  const favoriteCafes = favorites.filter((favorite) =>
    favorite.startsWith("cafe:"),
  ).length;
  const favoriteCreators = favorites.filter((favorite) =>
    favorite.startsWith("creator:"),
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="즐겨찾기한 카페"
          value={favoriteCafes}
          helper="공간 찾기 카드에서 카페를 저장할 수 있습니다."
          icon={<Coffee size={20} aria-hidden="true" />}
        />
        <StatCard
          label="즐겨찾기한 아티스트"
          value={favoriteCreators}
          helper="그룹 등록 흐름과 문화 활동에서 관심 아티스트를 저장합니다."
          icon={<Palette size={20} aria-hidden="true" />}
        />
        <StatCard
          label="작성한 후기"
          value={reviews.length}
          helper="사용자 계정으로 카페와 아티스트 후기를 남깁니다."
          icon={<MessageSquareText size={20} aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-ink">내 즐겨찾기</h2>
          <div className="mt-4 space-y-3">
            {favorites.length ? (
              favorites.map((favorite) => (
                <article
                  key={favorite}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <p className="font-bold text-primary">
                    {favoriteTitle(favorite)}
                  </p>
                  <p className="mt-1 text-sm text-ink/64">
                    {favorite.startsWith("cafe:") ? "카페 공간" : "아티스트"}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-ink/70">
                아직 즐겨찾기가 없습니다. 공간 찾기에서 마음에 드는 카페를
                저장해보세요.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-ink">내 후기</h2>
          <div className="mt-4 space-y-3">
            {reviews.length ? (
              reviews.slice(0, 5).map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-primary">
                      {review.targetName}
                    </p>
                    <p className="text-sm font-bold text-accent">
                      {review.rating}점
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/70">
                    {review.content}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-ink/70">
                {user?.name}님이 남긴 후기가 아직 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CreatorDashboard() {
  const [projectCards, setProjectCards] = useState<CreatorProject[]>([]);
  const [applications, setApplications] = useState<CafeApplication[]>([]);

  useEffect(() => {
    setProjectCards(readStorage<CreatorProject[]>(GROUP_CARD_STORAGE_KEY, []));
    setApplications(
      readStorage<CafeApplication[]>(CAFE_APPLICATION_STORAGE_KEY, []),
    );
  }, []);

  const collaborationPlaces = useMemo<CollaborationPlace[]>(() => {
    const placeMap = new Map<string, CollaborationPlace>();

    applications.forEach((application) => {
      const current = placeMap.get(application.cafeId);
      const projectTitle = application.projectTitle || "프로젝트 제목 미입력";

      if (!current) {
        placeMap.set(application.cafeId, {
          cafeId: application.cafeId,
          cafeName: application.cafeName,
          count: 1,
          projectTitles: [projectTitle],
          lastAppliedAt: application.createdAt,
        });
        return;
      }

      current.count += 1;
      current.projectTitles = Array.from(
        new Set([...current.projectTitles, projectTitle]),
      );
      if (new Date(application.createdAt) > new Date(current.lastAppliedAt)) {
        current.lastAppliedAt = application.createdAt;
      }
    });

    return Array.from(placeMap.values()).sort(
      (a, b) =>
        new Date(b.lastAppliedAt).getTime() -
        new Date(a.lastAppliedAt).getTime(),
    );
  }, [applications]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="저장된 프로젝트 카드"
          value={projectCards.length}
          helper="그룹 등록 화면에서 저장한 프로젝트 요약입니다."
          icon={<Palette size={20} aria-hidden="true" />}
        />
        <StatCard
          label="협업 신청 횟수"
          value={applications.length}
          helper="카페에 신청 완료한 기록을 누적합니다."
          icon={<FileText size={20} aria-hidden="true" />}
        />
        <StatCard
          label="협업 장소"
          value={collaborationPlaces.length}
          helper="신청한 카페를 장소별로 묶어 보여줍니다."
          icon={<Store size={20} aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-accent">프로젝트 카드</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">
                내 작업실에 저장된 프로젝트 요약
              </h2>
            </div>
            <Link
              href="/creators"
              className="focus-ring inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              카드 편집하기
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {projectCards.length ? (
              projectCards.map((card) => (
                <article
                  key={card.id}
                  className="flex h-full flex-col rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-accent">
                        {eventTypeLabel(card.eventType)}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-ink">
                        {card.projectTitle || "프로젝트 제목 미입력"}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-primary/75">
                        {card.name || "이름 없는 그룹"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-mist px-3 py-1 text-xs font-bold text-primary">
                      {card.genre}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/70">
                    {card.introduction ||
                      "프로젝트 소개를 입력하면 작업실 카드에 짧게 표시됩니다."}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-ink/70">
                    <p className="flex items-center gap-2">
                      <MapPin size={15} className="text-sage" aria-hidden="true" />
                      {card.preferredRegion}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock
                        size={15}
                        className="text-sage"
                        aria-hidden="true"
                      />
                      {card.preferredTime}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5 md:col-span-2">
                <p className="font-bold text-primary">
                  아직 저장된 프로젝트 카드가 없습니다.
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  그룹 등록 화면에서 프로젝트를 저장하면 이 작업실에 요약
                  카드로 표시됩니다.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-accent">카페 협업 기록</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            신청한 장소와 횟수
          </h2>

          <div className="mt-5 space-y-3">
            {collaborationPlaces.length ? (
              collaborationPlaces.map((place) => (
                <article
                  key={place.cafeId}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">{place.cafeName}</p>
                      <p className="mt-1 text-sm text-ink/64">
                        최근 신청 {formatShortDate(place.lastAppliedAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                      {place.count}회
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/70">
                    {place.projectTitles.join(", ")}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <p className="font-bold text-primary">
                  아직 협업 신청 기록이 없습니다.
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  공간 찾기에서 카페에 신청하면 장소와 신청 횟수가 여기에
                  누적됩니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CafeOwnerDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
          <Store size={22} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-ink">카페 운영 화면</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          영업을 유지하면서 활용 가능한 공간 이미지와 장비를 등록하고
          아티스트 신청을 받을 수 있습니다.
        </p>
        <Link
          href="/cafes/register"
          className="focus-ring mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          카페 공간 등록하기
        </Link>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-ink">운영 지표 예시</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-lg border border-line bg-background p-4">
            <p className="text-sm font-semibold text-primary/70">
              이번 달 매칭 요청
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">12</p>
          </article>
          <article className="rounded-lg border border-line bg-background p-4">
            <p className="text-sm font-semibold text-primary/70">
              조용한 시간 활용률
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">68%</p>
          </article>
        </div>
        <div className="mt-4 space-y-3">
          {events.slice(0, 3).map((event) => (
            <article
              key={event.id}
              className="rounded-lg border border-line bg-background p-4"
            >
              <p className="font-bold text-primary">{event.title}</p>
              <p className="mt-1 text-sm text-ink/64">
                {event.date} · {event.time}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function RoleDashboard() {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-primary">화면을 준비 중입니다.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
          <Heart size={22} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-ink">
          기본 화면은 사용자 탐색 화면입니다.
        </h1>
        <p className="mt-3 text-base leading-7 text-ink/72">
          로그인/회원가입을 하면 사용자는 즐겨찾기와 후기를, 아티스트와 카페
          주인은 각자에게 맞는 작업 화면을 사용할 수 있습니다.
        </p>
        <Link
          href="/onboarding"
          className="focus-ring mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          로그인/회원가입으로 시작하기
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">
          {roleLabel(user.role)} 전용 화면
        </p>
        <h1 className="mt-2 text-4xl font-bold text-ink">
          {user.name}님, 필요한 기능만 먼저 보여드릴게요.
        </h1>
        <p className="mt-3 flex items-center gap-2 text-sm leading-6 text-ink/70">
          <ClipboardList size={17} className="text-sage" aria-hidden="true" />
          같은 사이트 안에서도 역할에 따라 주요 CTA, 저장 기능, 등록 화면이
          달라집니다.
        </p>
      </section>

      {user.role === "consumer" ? <ConsumerDashboard /> : null}
      {user.role === "creator" ? <CreatorDashboard /> : null}
      {user.role === "cafeOwner" ? <CafeOwnerDashboard /> : null}

      {user.role === "consumer" ? (
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <Star size={18} aria-hidden="true" />
            <h2 className="font-bold">사용자 기능 안내</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            공간 찾기 페이지의 카페 카드에서 카페를 즐겨찾기하고 후기를
            남길 수 있습니다.
          </p>
        </section>
      ) : null}
    </div>
  );
}
