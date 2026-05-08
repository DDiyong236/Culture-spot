"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Heart, MessageSquareText, Star } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import type { FavoriteTargetType } from "@/types";

type ConsumerEngagementProps = {
  targetId: string;
  targetType: FavoriteTargetType;
  targetName: string;
  compact?: boolean;
};

function targetLabel(targetType: FavoriteTargetType) {
  return targetType === "cafe" ? "카페" : "창작자";
}

export default function ConsumerEngagement({
  targetId,
  targetType,
  targetName,
  compact = false,
}: ConsumerEngagementProps) {
  const {
    user,
    hydrated,
    isFavorite,
    toggleFavorite,
    addReview,
    getReviewsForTarget,
  } = useAuth();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const target = { id: targetId, type: targetType, name: targetName };
  const favorite = isFavorite(target);
  const reviews = getReviewsForTarget(targetType, targetId);

  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="rounded-lg border border-line bg-background p-3">
        <p className="text-sm leading-6 text-ink/70">
          로그인하면 {targetName}을 즐겨찾기하고 후기를 남길 수 있습니다.
        </p>
        <Link
          href="/onboarding"
          className="focus-ring mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          로그인/회원가입
        </Link>
      </div>
    );
  }

  if (user.role !== "consumer") {
    return null;
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addReview({
      targetId,
      targetType,
      targetName,
      rating,
      content,
    });
    setContent("");
    setRating(5);
  }

  return (
    <section className="rounded-lg border border-line bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary">
            {targetLabel(targetType)} 소비자 기능
          </p>
          <p className="mt-1 text-xs text-ink/62">
            즐겨찾기와 후기는 브라우저에 목 데이터로 저장됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(target)}
          className={`focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
            favorite
              ? "bg-accent text-white"
              : "border border-line bg-white text-primary hover:border-accent"
          }`}
        >
          <Heart
            size={16}
            aria-hidden="true"
            className={favorite ? "fill-current" : ""}
          />
          {favorite ? "저장됨" : "즐겨찾기"}
        </button>
      </div>

      {!compact ? (
        <>
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-[0.28fr_0.72fr]">
              <label className="space-y-1.5">
                <span className="label">평점</span>
                <select
                  className="form-field"
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((score) => (
                    <option key={score} value={score}>
                      {score}점
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="label">후기</span>
                <input
                  className="form-field"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={`${targetName}에 대한 짧은 후기를 남겨보세요.`}
                />
              </label>
            </div>
            <button
              type="submit"
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              <MessageSquareText size={16} aria-hidden="true" />
              후기 남기기
            </button>
          </form>

          {reviews.length ? (
            <div className="mt-4 space-y-2">
              {reviews.slice(0, 2).map((review) => (
                <article key={review.id} className="rounded-lg bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-primary">
                      소비자 후기
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs font-bold text-accent">
                      <Star size={13} className="fill-current" aria-hidden="true" />
                      {review.rating}점
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-ink/70">
                    {review.content}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
