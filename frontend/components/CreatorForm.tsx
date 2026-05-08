"use client";

import { FormEvent, useEffect, useState } from "react";
import { PencilLine, PlusCircle, Save, Sparkles, UsersRound } from "lucide-react";
import type { CreatorProject, EventType, MatchingResult } from "@/types";
import { cafeSpaces } from "@/data/mock";
import { rankCafeMatches } from "@/lib/matching";
import CafeCard from "@/components/CafeCard";
import { eventTypeLabel } from "@/lib/utils";
import { GROUP_CARD_STORAGE_KEY } from "@/lib/storageKeys";

const timeOptions = [
  "평일 오전",
  "평일 오후",
  "평일 저녁",
  "금요일 저녁",
  "토요일 오후",
  "토요일 저녁",
  "일요일 오전",
  "일요일 오후",
];

const regionOptions = [
  "연남",
  "망원",
  "성수",
  "해방촌",
  "익선",
  "을지로",
  "신촌",
  "경리단",
];

const genreOptionsByEventType: Record<EventType, string[]> = {
  performance: ["락", "어쿠스틱", "발라드", "재즈", "힙합"],
  exhibition: ["그림", "사진", "물품", "마술", "일러스트"],
  "pop-up": ["굿즈", "플리마켓", "워크숍", "공예", "브랜드 팝업"],
};

const defaultConditionsByEventType: Record<EventType, string[]> = {
  performance: ["코너 공간", "스피커", "소음 허용"],
  exhibition: ["벽면 공간", "조명"],
  "pop-up": ["코너 공간", "조명"],
};

const defaultAudienceByEventType: Record<EventType, number> = {
  performance: 24,
  exhibition: 18,
  "pop-up": 20,
};

const defaultBudgetByEventType: Record<EventType, number> = {
  performance: 60000,
  exhibition: 40000,
  "pop-up": 30000,
};

const defaultGroupForm: CreatorProject = {
  id: "draft-group",
  name: "",
  genre: "락",
  projectTitle: "",
  eventType: "performance",
  requiredConditions: defaultConditionsByEventType.performance,
  expectedAudience: defaultAudienceByEventType.performance,
  preferredRegion: "연남",
  budget: defaultBudgetByEventType.performance,
  preferredTime: "평일 저녁",
  introduction: "",
  portfolioUrl: "",
};

export default function CreatorForm() {
  const [form, setForm] = useState<CreatorProject>(defaultGroupForm);
  const [groupCards, setGroupCards] = useState<CreatorProject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [results, setResults] = useState<MatchingResult[]>([]);
  const genreOptions = genreOptionsByEventType[form.eventType].includes(
    form.genre,
  )
    ? genreOptionsByEventType[form.eventType]
    : [form.genre, ...genreOptionsByEventType[form.eventType]].filter(Boolean);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GROUP_CARD_STORAGE_KEY);
      if (raw) setGroupCards(JSON.parse(raw) as CreatorProject[]);
    } catch {
      setGroupCards([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      GROUP_CARD_STORAGE_KEY,
      JSON.stringify(groupCards),
    );
  }, [groupCards, hydrated]);

  function update<K extends keyof CreatorProject>(
    key: K,
    value: CreatorProject[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateEventType(eventType: EventType) {
    setForm((current) => ({
      ...current,
      eventType,
      genre: genreOptionsByEventType[eventType][0],
      requiredConditions: defaultConditionsByEventType[eventType],
      expectedAudience: defaultAudienceByEventType[eventType],
      budget: defaultBudgetByEventType[eventType],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const savedCard = {
      ...form,
      id: editingId ?? `group-${Date.now()}`,
    };

    setGroupCards((current) =>
      editingId
        ? current.map((card) => (card.id === editingId ? savedCard : card))
        : [savedCard, ...current],
    );
    setForm(savedCard);
    setEditingId(null);
    setResults(rankCafeMatches(savedCard, cafeSpaces, 4));
  }

  function startEdit(card: CreatorProject) {
    setForm(card);
    setEditingId(card.id);
    setResults(rankCafeMatches(card, cafeSpaces, 4));
  }

  function resetForm() {
    setForm({ ...defaultGroupForm, id: "draft-group" });
    setEditingId(null);
    setResults([]);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-white p-5 shadow-soft"
      >
        <div>
          <p className="text-sm font-semibold text-accent">그룹 등록</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            어떤 그룹 프로젝트를 동네 카페에 올리고 싶나요?
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            같은 팀이 어쿠스틱, 락, 전시, 팝업처럼 다른 형태로 바뀌어도
            그룹 카드로 저장하고 다시 편집할 수 있습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="label">그룹 이름</span>
            <input
              className="form-field"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="모노폴 세션"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">이벤트 유형</span>
            <select
              className="form-field"
              value={form.eventType}
              onChange={(event) =>
                updateEventType(event.target.value as EventType)
              }
            >
              <option value="performance">공연</option>
              <option value="exhibition">전시</option>
              <option value="pop-up">팝업</option>
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label">프로젝트 제목</span>
            <input
              className="form-field"
              value={form.projectTitle}
              onChange={(event) => update("projectTitle", event.target.value)}
              placeholder="비 온 뒤의 창문"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">장르</span>
            <select
              className="form-field"
              value={form.genre}
              onChange={(event) => update("genre", event.target.value)}
            >
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label">희망 지역</span>
            <select
              className="form-field"
              value={form.preferredRegion}
              onChange={(event) => update("preferredRegion", event.target.value)}
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="label">희망 시간대</span>
            <select
              className="form-field"
              value={form.preferredTime}
              onChange={(event) => update("preferredTime", event.target.value)}
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label">포트폴리오 URL</span>
            <input
              className="form-field"
              value={form.portfolioUrl}
              onChange={(event) => update("portfolioUrl", event.target.value)}
              placeholder="https://"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="space-y-1.5">
            <span className="label">그룹/프로젝트 소개</span>
            <textarea
              className="form-field min-h-24"
              value={form.introduction}
              onChange={(event) => update("introduction", event.target.value)}
              placeholder="이번 프로젝트의 분위기, 관객 경험, 운영 중인 카페 안에서 자연스럽게 진행되는 방식을 적어주세요."
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
          >
            {editingId ? (
              <Save size={18} aria-hidden="true" />
            ) : (
              <Sparkles size={18} aria-hidden="true" />
            )}
            {editingId ? "그룹 카드 수정하기" : "그룹 카드 저장하기"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-background px-4 py-3 text-sm font-bold text-primary transition hover:border-accent sm:w-auto"
          >
            <PlusCircle size={18} aria-hidden="true" />
            새 그룹
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">저장된 그룹 카드</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              장르가 바뀌어도 카드별로 다시 편집할 수 있습니다.
            </h2>
          </div>
          <p className="text-sm font-semibold text-primary">
            {groupCards.length}개 저장
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groupCards.length ? (
            groupCards.map((card) => (
              <article
                key={card.id}
                className="flex h-full flex-col rounded-lg border border-line bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary/68">
                      {eventTypeLabel(card.eventType)}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-ink">
                      {card.name || "이름 없는 그룹"}
                    </h3>
                  </div>
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-primary">
                    {card.genre}
                  </span>
                </div>
                <p className="mt-3 font-bold text-primary">
                  {card.projectTitle || "프로젝트 제목 미입력"}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/70">
                  {card.introduction ||
                    "그룹 소개를 입력하면 이 카드에 프로젝트 설명이 저장됩니다."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge">{card.preferredRegion}</span>
                  <span className="badge">{card.preferredTime}</span>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(card)}
                  className="focus-ring mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
                >
                  <PencilLine size={16} aria-hidden="true" />
                  이 카드 편집
                </button>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-background p-5 md:col-span-2 xl:col-span-3">
              <div className="flex items-center gap-2 text-primary">
                <UsersRound size={18} aria-hidden="true" />
                <p className="font-bold">아직 저장된 그룹 카드가 없습니다.</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                그룹 정보를 입력하고 저장하면 이곳에 카드가 생깁니다. 이후
                어쿠스틱, 락, 팝업처럼 프로젝트 성격이 바뀔 때 다시 편집할 수
                있습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-5">
        {results.length ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {results.map((result) => (
                <CafeCard
                  key={result.cafe.id}
                  cafe={result.cafe}
                  score={result.totalScore}
                  reason={result.recommendationReason}
                  compact
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-accent">
              등록 미리보기 대기 중
            </p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              그룹 정보를 입력하면 등록 카드가 저장됩니다.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              저장 후 그룹 카드와 함께 이벤트 유형, 장르, 지역, 시간대에 맞는
              추천 카페를 그리드로 확인할 수 있습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
