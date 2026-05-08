"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Link as LinkIcon,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import ProjectMatchAction from "@/components/ProjectMatchAction";
import { creators } from "@/data/mock";
import { creatorImages } from "@/lib/creatorAssets";
import { eventTypeLabel, unique } from "@/lib/utils";
import type { CreatorProject, EventType } from "@/types";

const eventOptions: Array<{ value: "all" | EventType; label: string }> = [
  { value: "all", label: "전체 유형" },
  { value: "performance", label: "공연" },
  { value: "exhibition", label: "전시" },
  { value: "pop-up", label: "팝업" },
];

function ArtistProjectCard({ project }: { project: CreatorProject }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <Link
        href={`/creators/${project.id}`}
        className="focus-ring relative block h-48 shrink-0 overflow-hidden"
        aria-label={`${project.projectTitle} 자세히 보기`}
      >
        <img
          src={creatorImages[project.eventType]}
          alt={`${project.projectTitle} 프로젝트 이미지`}
          className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/creators/${project.id}`}
              className="text-lg font-bold text-ink transition hover:text-primary"
            >
              {project.projectTitle}
            </Link>
            <span className="badge">{project.genre}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-primary/75">
            <Sparkles size={15} aria-hidden="true" />
            {project.name}
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-ink/72">
          {project.introduction}
        </p>

        <div className="grid content-start gap-2 text-sm text-ink/74 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-sage" aria-hidden="true" />
            {project.preferredRegion}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock size={16} className="text-sage" aria-hidden="true" />
            {project.preferredTime}
          </p>
          <p className="flex items-center gap-2 sm:col-span-2">
            <LinkIcon size={16} className="text-sage" aria-hidden="true" />
            {project.portfolioUrl}
          </p>
        </div>

        <div className="flex flex-wrap content-start gap-2">
          {project.requiredConditions.slice(0, 4).map((condition) => (
            <span
              key={condition}
              className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-primary"
            >
              {condition}
            </span>
          ))}
        </div>

        <ProjectMatchAction project={project} />
      </div>
    </article>
  );
}

export default function ProjectsPage() {
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

  const filteredProjects = creators.filter((creator) => {
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
            아티스트 프로젝트 {filteredProjects.length}개
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <ArtistProjectCard key={project.id} project={project} />
          ))}
        </div>

        {!filteredProjects.length ? (
          <div className="mt-5 rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="font-bold text-primary">
              조건에 맞는 아티스트 프로젝트가 없습니다.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
