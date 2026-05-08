"use client";

import Link from "next/link";
import { FormEvent, use, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Heart,
  Link as LinkIcon,
  MapPin,
  MessageSquareText,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { creators } from "@/data/mock";
import { creatorImages } from "@/lib/creatorAssets";
import { GROUP_CARD_STORAGE_KEY } from "@/lib/storageKeys";
import { baseLikeCount, eventTypeLabel } from "@/lib/utils";
import type { CreatorProject, Review } from "@/types";

const sampleReviews: Review[] = [
  {
    id: "sample-creator-review-1",
    targetId: "sample",
    targetType: "creator",
    targetName: "아티스트",
    rating: 5,
    content:
      "카페 안에서 부담 없이 볼 수 있는 규모라 좋았고, 작품 설명도 따뜻하게 느껴졌어요.",
    createdAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "sample-creator-review-2",
    targetId: "sample",
    targetType: "creator",
    targetName: "아티스트",
    rating: 4,
    content:
      "동네 산책 중 우연히 만난 프로젝트라 더 기억에 남았습니다. 다음 작업도 궁금해요.",
    createdAt: "2026-05-04T10:00:00.000Z",
  },
];

function readRegisteredCreators() {
  try {
    const raw = window.localStorage.getItem(GROUP_CARD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CreatorProject[]) : [];
  } catch {
    return [];
  }
}

function readPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    user,
    hydrated,
    addReview,
    getReviewsForTarget,
    isFavorite,
    toggleFavorite,
  } = useAuth();
  const [creator, setCreator] = useState<CreatorProject | null>(null);
  const [ready, setReady] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const foundCreator =
      creators.find((item) => item.id === id) ??
      readRegisteredCreators().find((item) => item.id === id) ??
      null;
    setCreator(foundCreator);
    setReady(true);
  }, [id]);

  const favoriteTarget = creator
    ? { id: creator.id, type: "creator" as const, name: creator.name }
    : null;
  const favorite = hydrated && favoriteTarget ? isFavorite(favoriteTarget) : false;
  const canToggle = hydrated && user?.role === "consumer" && favoriteTarget;
  const likeCount = creator ? baseLikeCount(creator.id) + (favorite ? 1 : 0) : 0;
  const showConsumerActions = !hydrated || !user || user.role === "consumer";

  const reviews = useMemo(() => {
    if (!creator) return [];
    return [
      ...getReviewsForTarget("creator", creator.id),
      ...sampleReviews.map((review) => ({
        ...review,
        targetId: creator.id,
        targetName: creator.name,
      })),
    ];
  }, [creator, getReviewsForTarget]);

  async function handlePhotoChange(file?: File) {
    if (!file) {
      setPhotoUrl("");
      return;
    }
    setPhotoUrl(await readPhoto(file));
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!creator) return;

    addReview({
      targetId: creator.id,
      targetType: "creator",
      targetName: creator.name,
      rating,
      content,
      photoUrl,
    });
    setRating(5);
    setContent("");
    setPhotoUrl("");
  }

  if (!ready) {
    return (
      <div className="min-h-screen py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-primary">
            아티스트 정보를 불러오는 중입니다.
          </p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="font-bold text-primary">아티스트를 찾을 수 없습니다.</p>
            <Link
              href="/creator-search"
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              아티스트 찾기로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/creator-search"
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-primary transition hover:border-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          아티스트 찾기로 돌아가기
        </Link>

        <section className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <div className="grid lg:grid-cols-[0.58fr_0.42fr]">
            <img
              src={creatorImages[creator.eventType]}
              alt={`${creator.projectTitle} 프로젝트 이미지`}
              className="h-80 w-full object-cover lg:h-full"
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-accent">
                    {eventTypeLabel(creator.eventType)}
                  </p>
                  <h1 className="mt-2 text-4xl font-bold text-ink">
                    {creator.projectTitle || "제목 없는 프로젝트"}
                  </h1>
                  <p className="mt-3 flex items-center gap-2 text-sm text-primary/75">
                    <Sparkles size={16} aria-hidden="true" />
                    {creator.name || "새로운 그룹"}
                  </p>
                </div>
                {showConsumerActions ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (canToggle && favoriteTarget) toggleFavorite(favoriteTarget);
                    }}
                    className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                      favorite
                        ? "bg-accent text-white"
                        : "border border-line bg-background text-primary"
                    } ${canToggle ? "hover:border-accent" : "cursor-default"}`}
                    aria-label={`${creator.name} 좋아요 ${likeCount}개`}
                  >
                    <Heart
                      size={16}
                      className={favorite ? "fill-current" : ""}
                      aria-hidden="true"
                    />
                    {likeCount}
                  </button>
                ) : null}
              </div>

              <p className="mt-5 text-base leading-7 text-ink/72">
                {creator.introduction || "아직 프로젝트 소개가 등록되지 않았습니다."}
              </p>

              <div className="mt-6 grid gap-3 text-sm text-ink/74 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Tag size={16} className="text-sage" aria-hidden="true" />
                  {creator.genre}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-sage" aria-hidden="true" />
                  {creator.preferredRegion}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock size={16} className="text-sage" aria-hidden="true" />
                  {creator.preferredTime}
                </p>
                <p className="flex items-center gap-2">
                  <LinkIcon size={16} className="text-sage" aria-hidden="true" />
                  {creator.portfolioUrl || "포트폴리오 링크 준비 중"}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {creator.requiredConditions.map((condition) => (
                  <span key={condition} className="badge">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`mt-6 grid gap-6 ${
            showConsumerActions ? "lg:grid-cols-[0.42fr_0.58fr]" : ""
          }`}
        >
          {showConsumerActions ? (
            <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-accent">후기 작성</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">
                이 아티스트 경험을 남겨주세요.
              </h2>

              {!hydrated ? null : user?.role === "consumer" ? (
                <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
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
                    <span className="label">사진</span>
                    <input
                      className="form-field file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                      type="file"
                      accept="image/*"
                      onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                    />
                  </label>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="후기 첨부 사진 미리보기"
                      className="h-36 w-full rounded-lg border border-line object-cover"
                    />
                  ) : null}
                  <label className="space-y-1.5">
                    <span className="label">후기</span>
                    <textarea
                      className="form-field min-h-28"
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder={`${creator.name}의 프로젝트를 본 경험을 적어주세요.`}
                    />
                  </label>
                  <button
                    type="submit"
                    className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
                  >
                    <MessageSquareText size={16} aria-hidden="true" />
                    후기 등록하기
                  </button>
                </form>
              ) : (
                <div className="mt-5 rounded-lg border border-line bg-background p-4">
                  <p className="text-sm leading-6 text-ink/70">
                    사용자 계정으로 로그인하면 평점, 사진, 후기를 등록할 수 있습니다.
                  </p>
                  <Link
                    href="/onboarding"
                    className="focus-ring mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                  >
                    로그인/회원가입
                  </Link>
                </div>
              )}
            </div>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-accent">사용자 후기</p>
                <h2 className="mt-1 text-2xl font-bold text-ink">
                  사람들이 남긴 반응
                </h2>
              </div>
              <p className="text-sm font-bold text-primary">{reviews.length}개</p>
            </div>

            <div className="mt-5 space-y-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-primary">사용자 후기</p>
                    <p className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                      <Star size={14} className="fill-current" aria-hidden="true" />
                      {review.rating}점
                    </p>
                  </div>
                  {review.photoUrl ? (
                    <img
                      src={review.photoUrl}
                      alt="후기 첨부 사진"
                      className="mt-3 h-44 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-ink/72">
                    {review.content}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
