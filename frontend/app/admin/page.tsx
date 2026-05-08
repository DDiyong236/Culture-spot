import {
  CalendarCheck,
  Coffee,
  Handshake,
  MapPinned,
  Palette,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { cafeSpaces, creators, events } from "@/data/mock";
import { rankCafeMatches } from "@/lib/matching";
import { unique } from "@/lib/utils";

function percentage(value: number) {
  return `${Math.round(value)}%`;
}

export default function AdminPage() {
  const averageUtilization =
    cafeSpaces.reduce((sum, cafe) => sum + cafe.utilizationRate, 0) /
    cafeSpaces.length;

  const genreCounts = creators.reduce<Record<string, number>>((acc, creator) => {
    acc[creator.genre] = (acc[creator.genre] ?? 0) + 1;
    return acc;
  }, {});

  const activeRegions = unique(cafeSpaces.map((cafe) => cafe.region)).map(
    (region) => ({
      region,
      cafes: cafeSpaces.filter((cafe) => cafe.region === region).length,
      events: events.filter((event) => {
        const cafe = cafeSpaces.find((item) => item.id === event.cafeId);
        return cafe?.region === region;
      }).length,
    }),
  );

  const recentRequests = creators.slice(0, 5).map((creator) => {
    const [topMatch] = rankCafeMatches(creator, cafeSpaces, 1);
    return {
      creator,
      cafe: topMatch.cafe,
      score: topMatch.totalScore,
      reason: topMatch.recommendationReason,
    };
  });

  const maxGenreCount = Math.max(...Object.values(genreCounts));

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent">
            간단 관리자 대시보드
          </p>
          <h1 className="mt-2 text-4xl font-bold text-ink">
            동네 카페 위에 쌓이는 문화 레이어를 확인하세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            목 통계로 등록 카페, 창작자, 예정 이벤트, 활용률, 최근 매칭
            요청을 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="등록 카페"
            value={cafeSpaces.length}
            helper="벽면, 코너, 한적한 시간대를 등록한 운영 중인 카페입니다."
            icon={<Coffee size={20} aria-hidden="true" />}
          />
          <StatCard
            label="등록 창작자"
            value={creators.length}
            helper="동네 문화 경험을 준비 중인 신진 창작자입니다."
            icon={<Palette size={20} aria-hidden="true" />}
          />
          <StatCard
            label="예정 이벤트"
            value={events.length}
            helper="작은 전시, 공연, 팝업이 예정되어 있습니다."
            icon={<CalendarCheck size={20} aria-hidden="true" />}
          />
          <StatCard
            label="성사된 매칭"
            value={events.length}
            helper="카페와 창작자 적합도를 바탕으로 생성된 목 이벤트입니다."
            icon={<Handshake size={20} aria-hidden="true" />}
          />
          <StatCard
            label="카페 활용률"
            value={percentage(averageUtilization)}
            helper="등록된 문화 표면의 평균 활용률입니다."
            icon={<TrendingUp size={20} aria-hidden="true" />}
          />
          <StatCard
            label="활성 지역"
            value={activeRegions.length}
            helper="등록 공간이 있는 동네 문화 거점입니다."
            icon={<MapPinned size={20} aria-hidden="true" />}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-ink">
              장르별 이벤트 분포
            </h2>
            <div className="mt-5 space-y-4">
              {Object.entries(genreCounts).map(([genre, count]) => (
                <div key={genre}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">{genre}</span>
                    <span className="text-ink/64">{count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-background">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${(count / maxGenreCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-ink">가장 활발한 지역</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {activeRegions.map((region) => (
                <article
                  key={region.region}
                  className="rounded-lg border border-line bg-background p-4"
                >
                  <p className="font-bold text-primary">{region.region}</p>
                  <p className="mt-2 text-sm text-ink/70">
                    카페 {region.cafes}곳 · 예정 이벤트 {region.events}개
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-ink">
            최근 매칭 요청
          </h2>
          <div className="mt-5 divide-y divide-line">
            {recentRequests.map((request) => (
              <article
                key={request.creator.id}
                className="grid gap-3 py-4 md:grid-cols-[0.25fr_0.25fr_0.15fr_0.35fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {request.creator.name}
                  </p>
                  <p className="text-sm text-ink/64">
                    {request.creator.projectTitle}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {request.cafe.name}
                  </p>
                  <p className="text-sm text-ink/64">{request.cafe.region}</p>
                </div>
                <p className="text-sm font-bold text-accent">
                  {request.score}/100
                </p>
                <p className="text-sm leading-6 text-ink/68">
                  {request.reason}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
