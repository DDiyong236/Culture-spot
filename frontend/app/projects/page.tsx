import { CalendarClock, MapPin, Users, Wallet } from "lucide-react";
import { creators } from "@/data/mock";
import { eventTypeLabel, formatCurrency } from "@/lib/utils";
import ProjectMatchAction from "@/components/ProjectMatchAction";

export default function ProjectsPage() {
  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent">
            창작자 프로젝트 찾기
          </p>
          <h1 className="mt-2 text-4xl font-bold text-ink">
            우리 카페에 어울릴 작은 문화 프로젝트를 찾아보세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            카페 영업을 멈추지 않고 벽면, 코너, 운영 중 협의 가능한 시간에
            자연스럽게 놓일 창작자 프로젝트를 살펴보는 카페 주인용 화면입니다.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {creators.map((creator) => (
            <article
              key={creator.id}
              className="flex h-full flex-col rounded-lg border border-line bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-accent">
                    {eventTypeLabel(creator.eventType)}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-ink">
                    {creator.projectTitle}
                  </h2>
                </div>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-primary">
                  {creator.genre}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-primary">
                {creator.name}
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/70">
                {creator.introduction}
              </p>

              <div className="mt-5 grid gap-2 text-sm text-ink/72">
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-sage" aria-hidden="true" />
                  희망 지역 {creator.preferredRegion}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarClock
                    size={16}
                    className="text-sage"
                    aria-hidden="true"
                  />
                  {creator.preferredTime}
                </p>
                <p className="flex items-center gap-2">
                  <Users size={16} className="text-sage" aria-hidden="true" />
                  예상 {creator.expectedAudience}명
                </p>
                <p className="flex items-center gap-2">
                  <Wallet size={16} className="text-sage" aria-hidden="true" />
                  예산 {formatCurrency(creator.budget)}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {creator.requiredConditions.map((condition) => (
                  <span key={condition} className="badge">
                    {condition}
                  </span>
                ))}
              </div>

              <ProjectMatchAction project={creator} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
