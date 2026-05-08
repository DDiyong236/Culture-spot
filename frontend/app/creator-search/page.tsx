"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { buildArtistProfiles, type ArtistProfile } from "@/lib/artists";
import { creatorImages } from "@/lib/creatorAssets";
import { GROUP_CARD_STORAGE_KEY } from "@/lib/storageKeys";
import { baseLikeCount, eventTypeLabel, unique } from "@/lib/utils";
import type { CreatorProject, EventType } from "@/types";

const eventOptions: Array<{ value: "all" | EventType; label: string }> = [
  { value: "all", label: "전체 유형" },
  { value: "performance", label: "공연" },
  { value: "exhibition", label: "전시" },
  { value: "pop-up", label: "팝업" },
];

function getArtistHeadlineTags(artist: ArtistProfile) {
  return unique(
    [
      artist.genres[0],
      artist.eventTypes[0] ? eventTypeLabel(artist.eventTypes[0]) : undefined,
      artist.preferredRegions[0],
    ].filter((tag): tag is string => Boolean(tag)),
  );
}

function readRegisteredCreators() {
  try {
    const raw = window.localStorage.getItem(GROUP_CARD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CreatorProject[]) : [];
  } catch {
    return [];
  }
}

function ArtistCard({ artist }: { artist: ArtistProfile }) {
  const { hydrated, user, isFavorite, toggleFavorite } = useAuth();
  const target = { id: artist.id, type: "creator" as const, name: artist.name };
  const favorite = hydrated ? isFavorite(target) : false;
  const likeCount = baseLikeCount(artist.id) + (favorite ? 1 : 0);
  const canToggle = hydrated && user?.role === "consumer";
  const imageType = artist.representativeProject.eventType;
  const headlineTags = getArtistHeadlineTags(artist);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <Link
        href={`/creators/${artist.id}`}
        className="focus-ring relative block h-48 shrink-0 overflow-hidden"
        aria-label={`${artist.name} 자세히 보기`}
      >
        <img
          src={creatorImages[imageType]}
          alt={`${artist.name} 아티스트 이미지`}
          className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
        />
        <div className="absolute right-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-primary shadow-soft">
          프로젝트 {artist.projects.length}개
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-ink">{artist.name}</h2>
              {headlineTags.map((tag) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-primary/75">
              <Sparkles size={15} aria-hidden="true" />
              {artist.projects.map((project) => project.projectTitle).join(", ")}
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
            aria-label={`${artist.name} 좋아요 ${likeCount}개`}
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
          {artist.introduction}
        </p>

        <div className="grid min-h-[4.5rem] content-start gap-2 text-sm text-ink/74 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-sage" aria-hidden="true" />
            {artist.preferredRegions.join(", ")}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock size={16} className="text-sage" aria-hidden="true" />
            {artist.preferredTimes.join(", ")}
          </p>
          <p className="flex items-center gap-2 sm:col-span-2">
            <LinkIcon size={16} className="text-sage" aria-hidden="true" />
            {artist.portfolioUrl}
          </p>
        </div>

        <Link
          href={`/creators/${artist.id}`}
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
  const [registeredCreators, setRegisteredCreators] = useState<CreatorProject[]>([]);

  useEffect(() => {
    setRegisteredCreators(readRegisteredCreators());
  }, []);

  const artistProfiles = useMemo(
    () => buildArtistProfiles([...registeredCreators, ...creators]),
    [registeredCreators],
  );

  const genres = useMemo(
    () =>
      unique(
        artistProfiles
          .filter(
            (artist) =>
              eventType === "all" || artist.eventTypes.includes(eventType),
          )
          .flatMap((artist) => artist.genres),
      ).sort(),
    [artistProfiles, eventType],
  );
  const regions = useMemo(
    () =>
      unique(
        artistProfiles.flatMap((artist) => artist.preferredRegions),
      ).sort(),
    [artistProfiles],
  );

  const filteredArtists = artistProfiles.filter((artist) => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (
      normalizedKeyword &&
      ![
        artist.name,
        artist.introduction,
        artist.portfolioUrl,
        ...artist.genres,
        ...artist.preferredRegions,
        ...artist.projects.map((project) => project.projectTitle),
        ...artist.projects.map((project) => project.introduction),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword)
    ) {
      return false;
    }
    if (eventType !== "all" && !artist.eventTypes.includes(eventType)) {
      return false;
    }
    if (genre !== "all" && !artist.genres.includes(genre)) return false;
    if (region !== "all" && !artist.preferredRegions.includes(region)) {
      return false;
    }
    return true;
  });

  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
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
            아티스트 {filteredArtists.length}명
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>

        {!filteredArtists.length ? (
          <div className="mt-5 rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="font-bold text-primary">조건에 맞는 아티스트가 없습니다.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
