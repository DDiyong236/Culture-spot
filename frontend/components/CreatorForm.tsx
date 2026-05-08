"use client";

import { FormEvent, useEffect, useState } from "react";
import { PencilLine, PlusCircle, Save, Sparkles, UsersRound } from "lucide-react";
import type { CreatorProject, EventType, MatchingResult } from "@/types";
import { cafeSpaces } from "@/data/mock";
import { rankCafeMatches } from "@/lib/matching";
import CafeCard from "@/components/CafeCard";
import { eventTypeLabel } from "@/lib/utils";

const conditionOptions = [
  "벽면 공간",
  "코너 공간",
  "프로젝터",
  "전시 벽",
  "스피커",
  "마이크",
  "조명",
  "조용한 분위기",
  "소음 허용",
];

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

const STORAGE_KEY = "local-stage-group-cards";

const defaultGroupForm: CreatorProject = {
  id: "draft-group",
  name: "",
  genre: "어쿠스틱",
  projectTitle: "",
  eventType: "performance",
  requiredConditions: ["코너 공간", "스피커"],
  expectedAudience: 20,
  preferredRegion: "연남",
  budget: 40000,
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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setGroupCards(JSON.parse(raw) as CreatorProject[]);
    } catch {
      setGroupCards([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groupCards));
  }, [groupCards, hydrated]);

  function update<K extends keyof CreatorProject>(
    key: K,
    value: CreatorProject[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCondition(condition: string) {
    const exists = form.requiredConditions.includes(condition);
    update(
      "requiredConditions",
      exists
        ? form.requiredConditions.filter((item) => item !== condition)
        : [...form.requiredConditions, condition],
    );
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
            <span className="label">현재 장르/셋</span>
            <input
              className="form-field"
              value={form.genre}
              onChange={(event) => update("genre", event.target.value)}
              placeholder="어쿠스틱, 락, 사진, 일러스트"
            />
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
            <span className="label">희망 지역</span>
            <input
              className="form-field"
              value={form.preferredRegion}
              onChange={(event) => update("preferredRegion", event.target.value)}
              placeholder="연남"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">이벤트 유형</span>
            <select
              className="form-field"
              value={form.eventType}
              onChange={(event) =>
                update("eventType", event.target.value as EventType)
              }
            >
              <option value="exhibition">전시</option>
              <option value="performance">공연</option>
              <option value="pop-up">팝업</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label">예상 관객 수</span>
            <input
              className="form-field"
              type="number"
              min="1"
              value={form.expectedAudience}
              onChange={(event) =>
                update("expectedAudience", Number(event.target.value))
              }
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">예산</span>
            <input
              className="form-field"
              type="number"
              min="0"
              step="5000"
              value={form.budget}
              onChange={(event) => update("budget", Number(event.target.value))}
            />
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
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.62fr_0.38fr]">
          <fieldset>
            <legend className="label">필요한 공간 조건</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {conditionOptions.map((condition) => (
                <label
                  key={condition}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-3 py-2 text-sm font-medium text-primary"
                >
                  <input
                    type="checkbox"
                    checked={form.requiredConditions.includes(condition)}
                    onChange={() => toggleCondition(condition)}
                    className="size-4 rounded border-line accent-accent"
                  />
                  {condition}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="space-y-1.5">
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
                  <span className="badge">예상 {card.expectedAudience}명</span>
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
            <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-accent">
                그룹 카드 미리보기
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-[0.36fr_0.64fr]">
                <div className="rounded-lg border border-line bg-background p-4">
                  <p className="text-sm font-semibold text-primary/70">
                    그룹
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-ink">
                    {form.name || "새로운 그룹"}
                  </h2>
                  <p className="mt-2 text-sm text-ink/68">
                    {form.genre} · {eventTypeLabel(form.eventType)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="badge">{form.preferredRegion}</span>
                    <span className="badge">{form.preferredTime}</span>
                    <span className="badge">예상 {form.expectedAudience}명</span>
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-background p-4">
                  <p className="text-sm font-semibold text-primary/70">
                    프로젝트
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-ink">
                    {form.projectTitle || "프로젝트 제목 미입력"}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-ink/70">
                    {form.introduction ||
                      "프로젝트 소개를 입력하면 이 영역에 그룹 카드 설명이 표시됩니다."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.requiredConditions.map((condition) => (
                      <span key={condition} className="badge">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-lg border border-line bg-white p-5 shadow-soft sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-accent">추천 공간</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">
                  이 그룹 프로젝트에 어울리는 카페 공간
                </h2>
              </div>
              <p className="text-sm font-semibold text-primary">
                추천 {results.length}곳
              </p>
            </div>
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
              저장 후 그룹 카드와 함께 지역, 공간 조건, 시간대, 예산,
              관객 규모에 맞는 추천 카페를 그리드로 확인할 수 있습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
