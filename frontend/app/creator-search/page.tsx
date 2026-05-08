"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Heart,
  Link as LinkIcon,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { creators } from "@/data/mock";
import { creatorImages } from "@/lib/creatorAssets";
import { baseLikeCount, eventTypeLabel, unique } from "@/lib/utils";
import type { CreatorProject, EventType } from "@/types";

const eventOptions: Array<{ value: "all" | EventType; label: string }> = [
  { value: "all", label: "전체 유형" },
  { value: "performance", label: "공연" },
  { value: "exhibition", label: "전시" },
  { value: "pop-up", label: "팝업" },
];

function CreatorProjectCard({ creator }: { creator: CreatorProject }) {
  const { hydrated, user, isFavorite, toggleFavorite } = useAuth();
  const target = { id: creator.id, type: "creator" as const, name: creator.name };
  const favorite = hydrated ? isFavorite(target) : false;
  const likeCount = baseLikeCount(creator.id) + (favorite ? 1 : 0);
  const canToggle = hydrated && user?.role === "consumer";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <Link
        href={`/creators/${creator.id}`}
        className="focus-ring relative block h-48 shrink-0 overflow-hidden"
        aria-label={`${creator.projectTitle} 자세히 보기`}
      >
        <img
          src={creatorImages[creator.eventType]}
          alt={`${creator.projectTitle} 프로젝트 이미지`}
          className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
        />
        <div className="absolute right-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-primary shadow-soft">
          {eventTypeLabel(creator.eventType)}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-ink">{creator.projectTitle}</h2>
              <span className="badge">{creator.genre}</span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-primary/75">
              <Sparkles size={15} aria-hidden="true" />
              {creator.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (canToggle) toggleFavorite(target);
            }}
            className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
              favorite
                ? "bg-accent text-white"
                : "border border-line bg-background text-primary"
            } ${canToggle ? "hover:border-accent" : "cursor-default"}`}
            aria-label={`${creator.name} 좋아요 ${likeCount}개`}
          >
            <Heart
              size={14}
              className={favorite ? "fill-current" : ""}
              aria-hidden="true"
            />
            {likeCount}
          </button>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-ink/72">
          {creator.introduction}
        </p>

        <div className="grid min-h-[4.5rem] content-start gap-2 text-sm text-ink/74 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-sage" aria-hidden="true" />
            {creator.preferredRegion}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock size={16} className="text-sage" aria-hidden="true" />
            {creator.preferredTime}
          </p>
          <p className="flex items-center gap-2 sm:col-span-2">
            <LinkIcon size={16} className="text-sage" aria-hidden="true" />
            {creator.portfolioUrl}
          </p>
        </div>

        <div className="flex flex-wrap content-start gap-2">
          {creator.requiredConditions.slice(0, 4).map((condition) => (
            <span
              key={condition}
              className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-primary"
            >
              {condition}
            </span>
          ))}
        </div>

        <Link
          href={`/creators/${creator.id}`}
          className="focus-ring mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <Sparkles size={16} aria-hidden="true" />
          아티스트 자세히 보기
        </Link>
      </div>
    </article>
  );
}

export default function CreatorSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [eventType, setEventType] = useState<"all" | EventType>("all");
  const [genre, setGenre] = useState("all");
  const [region, setRegion] = useState("all");

  const genres = useMemo(
    () =>
      unique(
        creators
          .filter((creator) => eventType === "all" || creator.eventType === eventType)
          .map((creator) => creator.genre),
      ).sort(),
    [eventType],
  );
  const regions = useMemo(
    () => unique(creators.map((creator) => creator.preferredRegion)).sort(),
    [],
  );

  const filteredCreators = creators.filter((creator) => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (
      normalizedKeyword &&
      ![
        creator.name,
        creator.genre,
        creator.projectTitle,
        creator.introduction,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword)
    ) {
      return false;
    }
    if (eventType !== "all" && creator.eventType !== eventType) return false;
    if (genre !== "all" && creator.genre !== genre) return false;
    if (region !== "all" && creator.preferredRegion !== region) return false;
    return true;
  });

  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent">아티스트 탐색</p>
          <h1 className="mt-2 text-4xl font-bold text-ink">
            동네 카페에서 만날 아티스트 프로젝트를 찾아보세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            전시, 공연, 팝업을 준비하는 아티스트 프로젝트를 공간 찾기처럼
            둘러보고 상세 페이지에서 후기와 프로젝트 정보를 확인할 수 있습니다.
          </p>
        </div>

        <section className="mt-8 rounded-lg border border-line bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <Search size={18} aria-hidden="true" />
            <h2 className="font-bold">필터</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5">
              <span className="label">검색어</span>
              <input
                className="form-field"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="아티스트, 장르, 프로젝트 검색"
              />
            </label>
            <label className="space-y-1.5">
              <span className="label">이벤트 유형</span>
              <select
                className="form-field"
                value={eventType}
                onChange={(event) => {
                  setEventType(event.target.value as "all" | EventType);
                  setGenre("all");
                }}
              >
                {eventOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="label">장르</span>
              <select
                className="form-field"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
              >
                <option value="all">전체 장르</option>
                {genres.map((genreOption) => (
                  <option key={genreOption} value={genreOption}>
                    {genreOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="label">선호 동네</span>
              <select
                className="form-field"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="all">전체 동네</option>
                {regions.map((regionOption) => (
                  <option key={regionOption} value={regionOption}>
                    {regionOption}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-primary">
            아티스트 프로젝트 {filteredCreators.length}개
          </p>
          <p className="text-sm text-ink/62">
            카드에서 자세히 보기로 이동해 후기와 정보를 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {filteredCreators.map((creator) => (
            <CreatorProjectCard key={creator.id} creator={creator} />
          ))}
        </div>

        {!filteredCreators.length ? (
          <div className="mt-5 rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="font-bold text-primary">조건에 맞는 아티스트가 없습니다.</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              검색어를 줄이거나 이벤트 유형, 장르, 동네 필터를 전체로 바꿔보세요.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
