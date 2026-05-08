import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { CafeSpace, CreatorProject, LocalEvent } from "@/types";
import { eventTypeLabel } from "@/lib/utils";

type EventCardProps = {
  event: LocalEvent;
  cafe: CafeSpace;
  creator: CreatorProject;
};

export default function EventCard({ event, cafe, creator }: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-card shadow-soft">
      <div className="relative h-44">
        <img
          src={cafe.image}
          alt={`${cafe.name}에서 열리는 ${event.title}`}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-primary">
          {eventTypeLabel(event.eventType)}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-bold text-ink">{event.title}</h3>
          <p className="mt-1 text-sm text-primary/75">
            {creator.name} · {creator.genre}
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-ink/72">
          <CalendarDays size={16} className="text-sage" aria-hidden="true" />
          {event.date} · {event.time}
        </p>
        <p className="flex items-center gap-2 text-sm text-ink/72">
          <MapPin size={16} className="text-sage" aria-hidden="true" />
          {cafe.name}, {cafe.region}
        </p>
        <p className="text-sm leading-6 text-ink/72">{event.description}</p>
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/events/${event.id}`}
          className="focus-ring inline-flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
        >
          이벤트 자세히 보기
        </Link>
      </div>
    </article>
  );
}
