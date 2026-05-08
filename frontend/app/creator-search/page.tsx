"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Link as LinkIcon,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import ConsumerEngagement from "@/components/ConsumerEngagement";
import { creators } from "@/data/mock";
import { eventTypeLabel, unique } from "@/lib/utils";
import type { EventType } from "@/types";

const eventOptions: Array<{ value: "all" | EventType; label: string }> = [
  { value: "all", label: "전체 유형" },
  { value: "performance", label: "공연" },
  { value: "exhibition", label: "전시" },
  { value: "pop-up", label: "팝업" },
];

export default function CreatorSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [eventType, setEventType] = useState<"all" | EventType>("all");
  const [region, setRegion] = useState("all");

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
    if (region !== "all" && creator.preferredRegion !== region) return false;
    return true;
  });

  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent">창작자 찾기</p>
          <h1 className="mt-2 text-4xl font-bold text-ink">
            동네 카페에서 만날 창작자와 프로젝트를 찾아보세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            전시, 공연, 팝업을 준비하는 창작자를 둘러보고 관심 있는 창작자를
            저장하거나 후기를 남길 수 있습니다.
          </p>
        </div>

        <section className="mt-8 rounded-lg border border-line bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <Search size={18} aria-hidden="true" />
            <h2 className="font-bold">필터</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <label className="space-y-1.5">
              <span className="label">검색어</span>
              <input
                className="form-field"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="창작자, 장르, 프로젝트 검색"
              />
            </label>
            <label className="space-y-1.5">
              <span className="label">이벤트 유형</span>
              <select
                className="form-field"
                value={eventType}
                onChange={(event) =>
                  setEventType(event.target.value as "all" | EventType)
                }
              >
                {eventOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
            창작자 프로젝트 {filteredCreators.length}개
          </p>
          <p className="text-sm text-ink/62">
            소비자는 관심 창작자를 저장하고 후기를 남길 수 있습니다.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {filteredCreators.map((creator) => (
            <article
              key={creator.id}
              className="flex h-full flex-col rounded-lg border border-line bg-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-ink">
                      {creator.name}
                    </h2>
                    <span className="badge">
                      {eventTypeLabel(creator.eventType)}
                    </span>
                    <span className="badge">{creator.genre}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {creator.projectTitle}
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
                  <Sparkles size={20} aria-hidden="true" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-ink/72">
                {creator.introduction}
              </p>

              <div className="mt-5 grid gap-2 text-sm text-ink/70 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-sage" aria-hidden="true" />
                  {creator.preferredRegion}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock
                    size={16}
                    className="text-sage"
                    aria-hidden="true"
                  />
                  {creator.preferredTime}
                </p>
                <p className="flex items-center gap-2 sm:col-span-2">
                  <LinkIcon size={16} className="text-sage" aria-hidden="true" />
                  {creator.portfolioUrl}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {creator.requiredConditions.slice(0, 4).map((condition) => (
                  <span key={condition} className="badge">
                    {condition}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-5">
                <ConsumerEngagement
                  targetId={creator.id}
                  targetType="creator"
                  targetName={creator.name}
                />
              </div>
            </article>
          ))}
        </div>

        {!filteredCreators.length ? (
          <div className="mt-5 rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="font-bold text-primary">조건에 맞는 창작자가 없습니다.</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              검색어를 줄이거나 이벤트 유형, 동네 필터를 전체로 바꿔보세요.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
