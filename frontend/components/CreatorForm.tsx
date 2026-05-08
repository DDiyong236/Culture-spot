"use client";

import { FormEvent, useState } from "react";
import { Sparkles } from "lucide-react";
import type { CreatorProject, EventType, MatchingResult } from "@/types";
import { cafeSpaces } from "@/data/mock";
import { rankCafeMatches } from "@/lib/matching";
import CafeCard from "@/components/CafeCard";

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

export default function CreatorForm() {
  const [form, setForm] = useState<CreatorProject>({
    id: "draft-creator",
    name: "",
    genre: "사진",
    projectTitle: "",
    eventType: "exhibition",
    requiredConditions: ["벽면 공간", "조용한 분위기"],
    expectedAudience: 20,
    preferredRegion: "연남",
    budget: 40000,
    preferredTime: "평일 오후",
    introduction: "",
    portfolioUrl: "",
  });
  const [results, setResults] = useState<MatchingResult[]>([]);

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
    setResults(rankCafeMatches(form, cafeSpaces, 4));
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-white p-5 shadow-soft"
      >
        <div>
          <p className="text-sm font-semibold text-accent">창작자 매칭</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            어떤 프로젝트를 동네 카페에 올리고 싶나요?
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            전체 대관이 아니라, 운영 중인 카페의 벽과 코너와 한적한
            시간대를 활용하는 매칭입니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="label">창작자 이름</span>
            <input
              className="form-field"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="박민아"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">장르</span>
            <input
              className="form-field"
              value={form.genre}
              onChange={(event) => update("genre", event.target.value)}
              placeholder="사진, 인디 음악, 시, 일러스트"
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
              <option value="book talk">북토크</option>
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
            <span className="label">프로젝트 소개</span>
            <textarea
              className="form-field min-h-24"
              value={form.introduction}
              onChange={(event) => update("introduction", event.target.value)}
              placeholder="프로젝트의 분위기, 관객 경험, 운영 중인 카페 안에서 자연스럽게 진행되는 방식을 적어주세요."
            />
          </label>
        </div>

        <button
          type="submit"
          className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          <Sparkles size={18} aria-hidden="true" />
          어울리는 카페 공간 찾기
        </button>
      </form>

      <section className="space-y-5">
        {results.length ? (
          <>
            <div className="flex flex-col justify-between gap-3 rounded-lg border border-line bg-white p-5 shadow-soft sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-accent">추천 매칭</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">
                  이 프로젝트에 어울리는 카페 공간
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
            <p className="text-sm font-semibold text-accent">매칭 대기 중</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              프로젝트를 입력하면 어울리는 카페를 추천합니다.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              지역, 공간 조건, 이벤트 유형, 시간대, 예산, 수용 인원, 소음
              허용 수준을 기준으로 추천 이유를 보여줍니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
