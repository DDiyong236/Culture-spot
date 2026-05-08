import Link from "next/link";
import {
  BadgeCheck,
  CalendarClock,
  Clock,
  MapPin,
  Projector,
  Users,
  Volume2,
} from "lucide-react";
import type { CafeSpace } from "@/types";
import CafeCardAction from "@/components/CafeCardAction";
import CafeLikeCount from "@/components/CafeLikeCount";
import {
  cafeSizeLabel,
  equipmentLabel,
  eventTypeLabel,
  formatOpeningHours,
  noiseLabel,
  scoreTone,
} from "@/lib/utils";

type CafeCardProps = {
  cafe: CafeSpace;
  score?: number;
  reason?: string;
  compact?: boolean;
  showLikeCount?: boolean;
};

export default function CafeCard({
  cafe,
  score,
  reason,
  compact = false,
  showLikeCount = true,
}: CafeCardProps) {
  const features = [cafe.atmosphere, cafeSizeLabel(cafe)];
  const summaryHeight = compact ? "min-h-[4.5rem]" : "min-h-0";
  const detailHeight = compact ? "min-h-[4.5rem]" : "min-h-[5rem]";
  const featureHeight = compact ? "min-h-[4.25rem]" : "min-h-0";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-soft">
      <Link href={`/cafes/${cafe.id}`} className="relative block h-48 shrink-0">
        <img
          src={cafe.image}
          alt={`${cafe.name} 내부 공간`}
          className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
        />
        {typeof score === "number" ? (
          <div
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${scoreTone(score)}`}
          >
            {score}% 매칭
          </div>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className={summaryHeight}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/cafes/${cafe.id}`}
                  className="text-lg font-bold text-ink transition hover:text-primary"
                >
                  {cafe.name}
                </Link>
                {cafe.availableTypes.map((type) => (
                  <span key={type} className="badge">
                    {eventTypeLabel(type)}
                  </span>
                ))}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-primary/75">
                <MapPin size={15} aria-hidden="true" />
                {cafe.region} · {cafe.address}
              </p>
            </div>
            {showLikeCount ? (
              <CafeLikeCount cafeId={cafe.id} cafeName={cafe.name} />
            ) : null}
          </div>
          {!compact ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/72">
              {cafe.description}
            </p>
          ) : null}
        </div>

        <div className={`grid content-start gap-2 text-sm text-ink/74 sm:grid-cols-2 ${detailHeight}`}>
          <p className="flex items-center gap-2">
            <Clock size={16} className="text-sage" aria-hidden="true" />
            오픈 {formatOpeningHours(cafe)}
          </p>
          <p className="flex items-center gap-2">
            <Users size={16} className="text-sage" aria-hidden="true" />
            수용 {cafe.capacity}명
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock size={16} className="text-sage" aria-hidden="true" />
            {cafe.availableTimeSlots.join(", ")}
          </p>
          <p className="flex items-center gap-2">
            <Projector size={16} className="text-sage" aria-hidden="true" />
            {cafe.equipment.map(equipmentLabel).join(", ")}
          </p>
          <p className="flex items-center gap-2">
            <Volume2 size={16} className="text-sage" aria-hidden="true" />
            소음 허용 {noiseLabel(cafe.noiseTolerance)}
          </p>
        </div>

        <div className={`flex flex-wrap content-start gap-2 ${featureHeight}`}>
          {features.slice(0, 5).map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-primary"
            >
              <BadgeCheck size={13} aria-hidden="true" />
              {feature}
            </span>
          ))}
        </div>

        {reason ? (
          <p className="rounded-lg border border-line bg-background p-3 text-sm leading-6 text-primary">
            {reason}
          </p>
        ) : null}

        <div className="mt-auto">
          <CafeCardAction cafe={cafe} />
        </div>
      </div>
    </article>
  );
}
