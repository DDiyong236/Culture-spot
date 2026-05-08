"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Coffee,
  FileText,
  Inbox,
  MapPin,
  MessageSquareText,
  Palette,
  Star,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import StatCard from "@/components/StatCard";
import { cafeSpaces, creators } from "@/data/mock";
import {
  CAFE_APPLICATION_STORAGE_KEY,
  CAFE_CARD_STORAGE_KEY,
  GROUP_CARD_STORAGE_KEY,
} from "@/lib/storageKeys";
import {
  projectApplicationStatus,
  readProjectApplications,
  type ProjectApplication,
} from "@/lib/projectApplications";
import {
  baseLikeCount,
  equipmentLabel,
  eventTypeLabel,
  formatOpeningHours,
} from "@/lib/utils";
import type { CafeSpace, CreatorProject } from "@/types";

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

function ConsumerDashboard() {
  const { favorites, reviews } = useAuth();
  const [registeredCafes, setRegisteredCafes] = useState<CafeSpace[]>([]);
  const [registeredCreators, setRegisteredCreators] = useState<CreatorProject[]>([]);

  useEffect(() => {
    setRegisteredCafes(readStorage<CafeSpace[]>(CAFE_CARD_STORAGE_KEY, []));
    setRegisteredCreators(
      readStorage<CreatorProject[]>(GROUP_CARD_STORAGE_KEY, []),
    );
  }, []);

  const allCafes = useMemo(
    () => [...registeredCafes, ...cafeSpaces],
    [registeredCafes],
  );
  const allCreators = useMemo(
    () => [...registeredCreators, ...creators],
    [registeredCreators],
  );
  const favoriteCafeIds = useMemo(
    () =>
      favorites
        .filter((favorite) => favorite.startsWith("cafe:"))
        .map((favorite) => favorite.replace("cafe:", "")),
    [favorites],
  );
  const favoriteCreatorIds = useMemo(
    () =>
      favorites
        .filter((favorite) => favorite.startsWith("creator:"))
        .map((favorite) => favorite.replace("creator:", "")),
    [favorites],
  );
  const favoriteCafes = useMemo(
    () =>
      favoriteCafeIds
        .map((id) => allCafes.find((cafe) => cafe.id === id))
        .filter(Boolean) as CafeSpace[],
    [allCafes, favoriteCafeIds],
  );
  const favoriteCreators = useMemo(
    () =>
      favoriteCreatorIds
        .map((id) => allCreators.find((creator) => creator.id === id))
        .filter(Boolean) as CreatorProject[],
    [allCreators, favoriteCreatorIds],
  );
  const recommendedCafes = useMemo(
    () =>
      allCafes
        .filter((cafe) => !favoriteCafeIds.includes(cafe.id))
        .sort((a, b) => baseLikeCount(b.id) - baseLikeCount(a.id))
        .slice(0, 3),
    [allCafes, favoriteCafeIds],
  );
  const recommendedCreators = useMemo(
    () =>
      allCreators
        .filter((creator) => !favoriteCreatorIds.includes(creator.id))
        .sort((a, b) => baseLikeCount(b.id) - baseLikeCount(a.id))
        .slice(0, 3),
    [allCreators, favoriteCreatorIds],
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="관심 카페"
          value={favoriteCafes.length}
          helper="저장한 카페 공간"
          icon={<Coffee size={20} aria-hidden="true" />}
        />
        <StatCard
          label="관심 아티스트"
          value={favoriteCreators.length}
          helper="저장한 아티스트"
          icon={<Palette size={20} aria-hidden="true" />}
        />
        <StatCard
          label="후기"
          value={reviews.length}
          helper="작성한 리뷰"
          icon={<MessageSquareText size={20} aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">내 관심 카페</h2>
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-primary">
              {favoriteCafes.length}곳
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {favoriteCafes.length ? (
              favoriteCafes.map((cafe) => (
                <Link
                  key={cafe.id}
                  href={`/cafes/${cafe.id}`}
                  className="focus-ring overflow-hidden rounded-lg border border-line bg-background transition hover:border-accent hover:bg-white"
                >
                  <img
                    src={cafe.image}
                    alt={`${cafe.name} 공간 이미지`}
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-primary">{cafe.name}</p>
                      {cafe.availableTypes.slice(0, 2).map((type) => (
                        <span key={type} className="badge">
                          {eventTypeLabel(type)}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/64">
                      <MapPin size={14} className="text-sage" aria-hidden="true" />
                      {cafe.region}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5 md:col-span-2">
                <p className="font-bold text-primary">저장한 카페가 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">내 관심 아티스트</h2>
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-primary">
              {favoriteCreators.length}명
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {favoriteCreators.length ? (
              favoriteCreators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.id}`}
                  className="focus-ring rounded-lg border border-line bg-background p-4 transition hover:border-accent hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">
                        {creator.projectTitle}
                      </p>
                      <p className="mt-1 text-sm text-ink/64">
                        {creator.name} · {creator.genre}
                      </p>
                    </div>
                    <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-primary">
                      {eventTypeLabel(creator.eventType)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/70">
                    {creator.introduction}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5 md:col-span-2">
                <p className="font-bold text-primary">
                  저장한 아티스트가 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">내 후기</h2>
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-primary">
              {reviews.length}개
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {reviews.length ? (
              reviews.slice(0, 5).map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-primary">{review.targetName}</p>
                    <p className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                      <Star size={14} className="fill-current" aria-hidden="true" />
                      {review.rating}점
                    </p>
                  </div>
                  {review.photoUrl ? (
                    <img
                      src={review.photoUrl}
                      alt={`${review.targetName} 후기 사진`}
                      className="mt-3 h-32 w-full rounded-lg border border-line object-cover"
                    />
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-ink/70">
                    {review.content}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <p className="font-bold text-primary">작성한 후기가 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">추천 동네 문화</h2>
            <Link
              href="/spaces"
              className="focus-ring rounded-lg border border-line bg-background px-3 py-2 text-sm font-bold text-primary transition hover:border-accent"
            >
              더 보기
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {recommendedCafes.map((cafe, index) => {
              const creator = recommendedCreators[index % recommendedCreators.length];

              return (
                <Link
                  key={cafe.id}
                  href={`/cafes/${cafe.id}`}
                  className="focus-ring overflow-hidden rounded-lg border border-line bg-background transition hover:border-accent hover:bg-white"
                >
                  <img
                    src={cafe.image}
                    alt={`${cafe.name} 추천 공간 이미지`}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-xs font-bold text-accent">
                      {cafe.region}
                    </p>
                    <p className="mt-1 font-bold text-primary">{cafe.name}</p>
                    {creator ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/70">
                        {creator.projectTitle} · {creator.genre}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
function CreatorDashboard() {
  const [projectCards, setProjectCards] = useState<CreatorProject[]>([]);
  const [applications, setApplications] = useState<CafeApplication[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ProjectApplication[]>([]);

  useEffect(() => {
    setProjectCards(readStorage<CreatorProject[]>(GROUP_CARD_STORAGE_KEY, []));
    setApplications(
      readStorage<CafeApplication[]>(CAFE_APPLICATION_STORAGE_KEY, []),
    );
    setReceivedRequests(readProjectApplications());
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

  const sentCafeProposals = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [applications],
  );

  const acceptedRequests = useMemo(
    () =>
      receivedRequests.filter(
        (request) => projectApplicationStatus(request) === "accepted",
      ),
    [receivedRequests],
  );

  const artistScheduleItems = useMemo(() => {
    return acceptedRequests.map((request) => ({
      id: request.id,
      title: request.projectTitle,
      cafeName: request.cafeName,
      dateLabel: request.acceptedAt
        ? `${formatShortDate(request.acceptedAt)} 수락`
        : "수락 완료",
      timeLabel: "세부 일정 협의 중",
      status: "수락됨",
      href: `/requests/${request.id}`,
    }));
  }, [acceptedRequests]);

  const primaryProject = projectCards[0] ?? null;
  const artistGenres = Array.from(
    new Set(projectCards.map((project) => project.genre).filter(Boolean)),
  );
  const artistEventTypes = Array.from(
    new Set(projectCards.map((project) => project.eventType)),
  );
  const artistRegions = Array.from(
    new Set(projectCards.map((project) => project.preferredRegion).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent">내 아티스트 프로필</p>
            <h2 className="mt-1 text-3xl font-bold text-ink">
              {primaryProject?.name || "아티스트 프로필 미등록"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/72">
              {primaryProject?.introduction ||
                "프로젝트를 등록하면 아티스트 소개와 대표 장르가 이곳에 표시됩니다."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {artistGenres.map((genre) => (
                <span key={genre} className="badge">
                  {genre}
                </span>
              ))}
              {artistEventTypes.map((type) => (
                <span key={type} className="badge">
                  {eventTypeLabel(type)}
                </span>
              ))}
              {artistRegions.map((region) => (
                <span key={region} className="badge">
                  {region}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/creators"
            className="focus-ring inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            {primaryProject ? "프로젝트 관리하기" : "프로젝트 등록하기"}
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "내 프로젝트",
              value: `${projectCards.length}개`,
              icon: <Palette size={18} aria-hidden="true" />,
            },
            {
              label: "받은 요청",
              value: `${receivedRequests.length}건`,
              icon: <Inbox size={18} aria-hidden="true" />,
            },
            {
              label: "보낸 제안",
              value: `${sentCafeProposals.length}건`,
              icon: <FileText size={18} aria-hidden="true" />,
            },
            {
              label: "확정 일정",
              value: `${artistScheduleItems.length}개`,
              icon: <CalendarClock size={18} aria-hidden="true" />,
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-line bg-background p-4"
            >
              <div className="flex items-center gap-2 text-primary">
                {item.icon}
                <p className="text-sm font-semibold">{item.label}</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">내 프로젝트</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              카페에 제안할 프로젝트 카드
            </h2>
          </div>
          <Link
            href="/creators"
            className="focus-ring inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            추가/수정
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
                      {card.name || "이름 없는 아티스트"}
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
                <div className="mt-4 grid gap-2 text-sm text-ink/70 sm:grid-cols-2">
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
            <div className="rounded-lg border border-dashed border-line bg-background p-5 lg:col-span-2">
              <p className="font-bold text-primary">
                아직 등록된 프로젝트가 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-accent">받은 요청</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">
                사장님이 보낸 협업 요청
              </h2>
            </div>
            <span className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-primary">
              {receivedRequests.length}건
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {receivedRequests.length ? (
              receivedRequests.map((request) => {
                const accepted = projectApplicationStatus(request) === "accepted";

                return (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="focus-ring block rounded-lg border border-line bg-background p-4 transition hover:border-accent hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-primary">
                          {request.cafeName}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {request.projectTitle}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          accepted ? "bg-sage text-white" : "bg-accent text-white"
                        }`}
                      >
                        {accepted ? "수락됨" : "대기 중"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-ink/64">
                      요청일 {formatShortDate(request.createdAt)}
                    </p>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <p className="font-bold text-primary">
                  아직 받은 협업 요청이 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-accent">보낸 제안</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">
                카페에 보낸 협업 제안
              </h2>
            </div>
            <span className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-primary">
              {sentCafeProposals.length}건
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {sentCafeProposals.length ? (
              sentCafeProposals.slice(0, 4).map((proposal) => (
                <Link
                  key={proposal.id}
                  href={`/cafes/${proposal.cafeId}`}
                  className="focus-ring block rounded-lg border border-line bg-background p-4 transition hover:border-accent hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">
                        {proposal.projectTitle || "프로젝트 제목 미입력"}
                      </p>
                      <p className="mt-1 text-sm text-ink/64">
                        {proposal.cafeName}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                      대기 중
                    </span>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-sm text-ink/70">
                    <CalendarClock
                      size={15}
                      className="text-sage"
                      aria-hidden="true"
                    />
                    제안일 {formatShortDate(proposal.createdAt)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <p className="font-bold text-primary">
                  아직 보낸 협업 제안이 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">확정 일정</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              수락된 카페 협업 일정
            </h2>
          </div>
          <span className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-primary">
            {artistScheduleItems.length}개
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {artistScheduleItems.length ? (
            artistScheduleItems.map((schedule) => (
              <Link
                key={schedule.id}
                href={schedule.href}
                className="focus-ring block rounded-lg border border-line bg-background p-4 transition hover:border-accent hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-primary">{schedule.title}</p>
                    <p className="mt-1 text-sm text-ink/64">
                      {schedule.cafeName}
                    </p>
                  </div>
                  <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">
                    {schedule.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-ink/70 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <CalendarClock
                      size={15}
                      className="text-sage"
                      aria-hidden="true"
                    />
                    {schedule.dateLabel}
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className="text-sage"
                      aria-hidden="true"
                    />
                    {schedule.timeLabel}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-background p-5 lg:col-span-2">
              <p className="font-bold text-primary">
                아직 확정된 일정이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent">지난 협업 기록</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              협업한 카페와 횟수
            </h2>
          </div>
          <span className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-primary">
            {collaborationPlaces.length}곳
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
            <div className="rounded-lg border border-dashed border-line bg-background p-5 lg:col-span-2">
              <p className="font-bold text-primary">
                아직 지난 협업 기록이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CafeOwnerDashboard() {
  const { reviews } = useAuth();
  const [registeredCafes, setRegisteredCafes] = useState<CafeSpace[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<
    CafeApplication[]
  >([]);
  const [sentRequests, setSentRequests] = useState<ProjectApplication[]>([]);

  useEffect(() => {
    setRegisteredCafes(readStorage<CafeSpace[]>(CAFE_CARD_STORAGE_KEY, []));
    setReceivedApplications(
      readStorage<CafeApplication[]>(CAFE_APPLICATION_STORAGE_KEY, []),
    );
    setSentRequests(readProjectApplications());
  }, []);

  const cafeIds = useMemo(
    () => new Set(registeredCafes.map((cafe) => cafe.id)),
    [registeredCafes],
  );
  const cafeReviews = useMemo(
    () =>
      reviews.filter(
        (review) => review.targetType === "cafe" && cafeIds.has(review.targetId),
      ),
    [cafeIds, reviews],
  );
  const averageRating = cafeReviews.length
    ? (
        cafeReviews.reduce((total, review) => total + review.rating, 0) /
        cafeReviews.length
      ).toFixed(1)
    : "-";
  const expectedLikes = registeredCafes.reduce(
    (total, cafe) => total + baseLikeCount(cafe.id),
    0,
  );
  const acceptedRequests = sentRequests.filter(
    (request) => projectApplicationStatus(request) === "accepted",
  );
  const pendingSentRequests = sentRequests.filter(
    (request) => projectApplicationStatus(request) !== "accepted",
  );
  const todoItems = [
    {
      label: "카페 공간 등록하기",
      done: registeredCafes.length > 0,
      helper: registeredCafes.length
        ? "등록된 카페 공간이 있습니다."
        : "먼저 운영 중인 카페 공간을 등록하세요.",
    },
    {
      label: "받은 협업 신청 확인하기",
      done: receivedApplications.length === 0,
      helper: receivedApplications.length
        ? `${receivedApplications.length}건의 아티스트 신청을 확인하세요.`
        : "새로 들어온 신청이 없습니다.",
    },
    {
      label: "보낸 협업 요청 상태 보기",
      done: pendingSentRequests.length === 0,
      helper: pendingSentRequests.length
        ? `${pendingSentRequests.length}건이 아직 대기 중입니다.`
        : "대기 중인 보낸 요청이 없습니다.",
    },
    {
      label: "사용자 리뷰 확인하기",
      done: cafeReviews.length === 0,
      helper: cafeReviews.length
        ? `${cafeReviews.length}개의 리뷰를 확인해보세요.`
        : "아직 새 리뷰가 없습니다.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">오늘 처리할 일</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              사장님 운영 체크
            </h2>
          </div>
          <Link
            href="/projects"
            className="focus-ring inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            아티스트 프로젝트 찾기
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {todoItems.map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-line bg-background p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                    item.done ? "bg-sage text-white" : "bg-accent text-white"
                  }`}
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold text-primary">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/70">
                    {item.helper}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">내 카페 정보</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              등록한 카페 공간 요약
            </h2>
          </div>
          <Link
            href="/cafes/register"
            className="focus-ring inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            카페 공간 등록하기
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {registeredCafes.length ? (
            registeredCafes.map((cafe) => (
              <article
                key={cafe.id}
                className="overflow-hidden rounded-lg border border-line bg-background"
              >
                <img
                  src={cafe.image}
                  alt={`${cafe.name} 공간 이미지`}
                  className="h-44 w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-ink">{cafe.name}</h3>
                    {cafe.availableTypes.map((type) => (
                      <span key={type} className="badge">
                        {eventTypeLabel(type)}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-primary/75">
                    <MapPin size={15} aria-hidden="true" />
                    {cafe.address}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-ink/70 sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <CalendarClock
                        size={15}
                        className="text-sage"
                        aria-hidden="true"
                      />
                      {formatOpeningHours(cafe)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Store size={15} className="text-sage" aria-hidden="true" />
                      {cafe.equipment.map(equipmentLabel).join(", ")}
                    </p>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/70">
                    {cafe.description}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-background p-5 lg:col-span-2">
              <p className="font-bold text-primary">
                아직 등록된 카페 공간이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-accent">받은 협업 신청</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            아티스트가 보낸 신청
          </h2>
          <div className="mt-5 space-y-3">
            {receivedApplications.length ? (
              receivedApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">
                        {application.projectTitle}
                      </p>
                      <p className="mt-1 text-sm text-ink/64">
                        {application.groupName} · {application.cafeName}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                      확인 필요
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-ink/64">
                    신청일 {formatShortDate(application.createdAt)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <p className="font-bold text-primary">
                  아직 받은 협업 신청이 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-accent">보낸 협업 요청</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            아티스트에게 보낸 제안
          </h2>
          <div className="mt-5 space-y-3">
            {sentRequests.length ? (
              sentRequests.map((request) => {
                const accepted = projectApplicationStatus(request) === "accepted";

                return (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="focus-ring block rounded-lg border border-line bg-background p-4 transition hover:border-accent hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-primary">
                          {request.projectTitle}
                        </p>
                        <p className="mt-1 text-sm text-ink/64">
                          {request.creatorName} · {request.cafeName}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          accepted ? "bg-sage text-white" : "bg-accent text-white"
                        }`}
                      >
                        {accepted ? "수락됨" : "대기 중"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-ink/64">
                      요청일 {formatShortDate(request.createdAt)}
                    </p>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <p className="font-bold text-primary">
                  아직 보낸 협업 요청이 없습니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">확정 일정</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              수락된 협업 일정
            </h2>
          </div>
          <Link
            href="/projects"
            className="focus-ring inline-flex items-center justify-center rounded-lg border border-line bg-background px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
          >
            아티스트 프로젝트 찾기
          </Link>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {acceptedRequests.length ? (
            acceptedRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="focus-ring block rounded-lg border border-line bg-background p-4 transition hover:border-accent hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-primary">
                      {request.projectTitle}
                    </p>
                    <p className="mt-1 text-sm text-ink/64">
                      {request.creatorName} · {request.cafeName}
                    </p>
                  </div>
                  <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-white">
                    일정 협의
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-ink/70">
                  <CalendarClock size={15} className="text-sage" aria-hidden="true" />
                  {request.acceptedAt
                    ? `${formatShortDate(request.acceptedAt)} 수락`
                    : "수락 완료"}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-background p-5 lg:col-span-2">
              <p className="font-bold text-primary">
                아직 확정된 문화 일정이 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">사용자 반응</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              평점과 후기 확인
            </h2>
          </div>
          <span className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-primary">
            후기 {cafeReviews.length}개
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.32fr_0.68fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-lg border border-line bg-background p-4">
              <p className="text-sm font-semibold text-primary/70">평균 평점</p>
              <p className="mt-2 text-3xl font-bold text-ink">{averageRating}</p>
            </article>
            <article className="rounded-lg border border-line bg-background p-4">
              <p className="text-sm font-semibold text-primary/70">관심 반응</p>
              <p className="mt-2 text-3xl font-bold text-ink">{expectedLikes}</p>
            </article>
          </div>

          <div className="space-y-3">
            {cafeReviews.length ? (
              cafeReviews.slice(0, 3).map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-primary">{review.targetName}</p>
                    <p className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                      <Star size={14} className="fill-current" aria-hidden="true" />
                      {review.rating}점
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/70">
                    {review.content}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <p className="font-bold text-primary">
                  아직 등록된 리뷰가 없습니다.
                </p>
              </div>
            )}
          </div>
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
        <Link
          href="/onboarding"
          className="focus-ring inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          로그인/회원가입
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {user.role === "consumer" ? <ConsumerDashboard /> : null}
      {user.role === "creator" ? <CreatorDashboard /> : null}
      {user.role === "cafeOwner" ? <CafeOwnerDashboard /> : null}
    </div>
  );
}
