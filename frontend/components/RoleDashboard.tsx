"use client";

import Link from "next/link";
import {
  ClipboardList,
  Coffee,
  Heart,
  MessageSquareText,
  Palette,
  Star,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import StatCard from "@/components/StatCard";
import { cafeSpaces, creators, events } from "@/data/mock";
import { rankCafeMatches } from "@/lib/matching";
import { roleLabel } from "@/lib/utils";

function favoriteTitle(key: string) {
  const [type, id] = key.split(":");
  if (type === "cafe") {
    return cafeSpaces.find((cafe) => cafe.id === id)?.name ?? "알 수 없는 카페";
  }
  return creators.find((creator) => creator.id === id)?.name ?? "알 수 없는 창작자";
}

function ConsumerDashboard() {
  const { user, favorites, reviews } = useAuth();
  const favoriteCafes = favorites.filter((favorite) =>
    favorite.startsWith("cafe:"),
  ).length;
  const favoriteCreators = favorites.filter((favorite) =>
    favorite.startsWith("creator:"),
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="즐겨찾기한 카페"
          value={favoriteCafes}
          helper="공간 찾기 카드에서 카페를 저장할 수 있습니다."
          icon={<Coffee size={20} aria-hidden="true" />}
        />
        <StatCard
          label="즐겨찾기한 창작자"
          value={favoriteCreators}
          helper="창작자 등록 흐름과 문화 활동에서 관심 창작자를 저장합니다."
          icon={<Palette size={20} aria-hidden="true" />}
        />
        <StatCard
          label="작성한 후기"
          value={reviews.length}
          helper="소비자 계정으로 카페와 창작자 후기를 남깁니다."
          icon={<MessageSquareText size={20} aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-ink">내 즐겨찾기</h2>
          <div className="mt-4 space-y-3">
            {favorites.length ? (
              favorites.map((favorite) => (
                <article
                  key={favorite}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <p className="font-bold text-primary">
                    {favoriteTitle(favorite)}
                  </p>
                  <p className="mt-1 text-sm text-ink/64">
                    {favorite.startsWith("cafe:") ? "카페 공간" : "창작자"}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-ink/70">
                아직 즐겨찾기가 없습니다. 공간 찾기에서 마음에 드는 카페를
                저장해보세요.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-ink">내 후기</h2>
          <div className="mt-4 space-y-3">
            {reviews.length ? (
              reviews.slice(0, 5).map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-primary">
                      {review.targetName}
                    </p>
                    <p className="text-sm font-bold text-accent">
                      {review.rating}점
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/70">
                    {review.content}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-ink/70">
                {user?.name}님이 남긴 후기가 아직 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CreatorDashboard() {
  const sampleCreator = creators[0];
  const matches = rankCafeMatches(sampleCreator, cafeSpaces, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
          <Palette size={22} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-ink">창작자 작업실</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          프로젝트 정보를 입력하면 카페 벽면, 코너, 시간대 조건을 기준으로
          어울리는 공간을 추천받습니다.
        </p>
        <Link
          href="/creators"
          className="focus-ring mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          창작자 등록하기
        </Link>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-ink">추천 공간 예시</h2>
        <div className="mt-4 space-y-3">
          {matches.map((match) => (
            <article
              key={match.cafe.id}
              className="rounded-lg border border-line bg-background p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-primary">{match.cafe.name}</p>
                <p className="text-sm font-bold text-accent">
                  {match.totalScore}/100
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                {match.recommendationReason}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CafeOwnerDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
          <Store size={22} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-ink">카페 운영 화면</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          영업을 유지하면서 활용 가능한 공간 이미지와 장비를 등록하고
          창작자 신청을 받을 수 있습니다.
        </p>
        <Link
          href="/cafes/register"
          className="focus-ring mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          카페 공간 등록하기
        </Link>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-ink">운영 지표 예시</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-lg border border-line bg-background p-4">
            <p className="text-sm font-semibold text-primary/70">
              이번 달 매칭 요청
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">12</p>
          </article>
          <article className="rounded-lg border border-line bg-background p-4">
            <p className="text-sm font-semibold text-primary/70">
              조용한 시간 활용률
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">68%</p>
          </article>
        </div>
        <div className="mt-4 space-y-3">
          {events.slice(0, 3).map((event) => (
            <article
              key={event.id}
              className="rounded-lg border border-line bg-background p-4"
            >
              <p className="font-bold text-primary">{event.title}</p>
              <p className="mt-1 text-sm text-ink/64">
                {event.date} · {event.time}
              </p>
            </article>
          ))}
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
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white">
          <Heart size={22} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-ink">
          기본 화면은 소비자 탐색 화면입니다.
        </h1>
        <p className="mt-3 text-base leading-7 text-ink/72">
          로그인/회원가입을 하면 소비자는 즐겨찾기와 후기를, 창작자와 카페
          주인은 각자에게 맞는 작업 화면을 사용할 수 있습니다.
        </p>
        <Link
          href="/onboarding"
          className="focus-ring mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          로그인/회원가입으로 시작하기
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">
          {roleLabel(user.role)} 전용 화면
        </p>
        <h1 className="mt-2 text-4xl font-bold text-ink">
          {user.name}님, 필요한 기능만 먼저 보여드릴게요.
        </h1>
        <p className="mt-3 flex items-center gap-2 text-sm leading-6 text-ink/70">
          <ClipboardList size={17} className="text-sage" aria-hidden="true" />
          같은 사이트 안에서도 역할에 따라 주요 CTA, 저장 기능, 등록 화면이
          달라집니다.
        </p>
      </section>

      {user.role === "consumer" ? <ConsumerDashboard /> : null}
      {user.role === "creator" ? <CreatorDashboard /> : null}
      {user.role === "cafeOwner" ? <CafeOwnerDashboard /> : null}

      {user.role === "consumer" ? (
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <Star size={18} aria-hidden="true" />
            <h2 className="font-bold">소비자 기능 안내</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            공간 찾기 페이지의 카페 카드에서 카페를 즐겨찾기하고 후기를
            남길 수 있습니다.
          </p>
        </section>
      ) : null}
    </div>
  );
}
