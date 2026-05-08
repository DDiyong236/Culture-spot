import Link from "next/link";
import { MapPin, Palette, Store } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-white">
      <img
        src="https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1800&q=80"
        alt="갤러리처럼 활용할 수 있는 따뜻한 동네 카페 공간"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-primary/72" />
      <div className="mx-auto flex min-h-[76vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-white/35 bg-white/12 px-3 py-1 text-sm font-semibold text-white">
            Local Stage
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] sm:text-6xl">
            일상의 카페를 동네의 작은 무대로.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">
            동네 카페는 작은 갤러리와 무대가 되고, 창작자는 주민이 이미
            오가는 공간에서 지역 관객을 만납니다.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">
            카페는 평소처럼 영업합니다. Local Stage는 쓰이지 않던 벽, 조용한
            코너, 한적한 시간대 위에 문화의 층을 더합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/spaces"
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-accent/90"
            >
              <MapPin size={18} aria-hidden="true" />
              공간 찾기
            </Link>
            <Link
              href="/cafes/register"
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-primary shadow-soft transition hover:bg-background"
            >
              <Store size={18} aria-hidden="true" />
              카페 등록하기
            </Link>
            <Link
              href="/creators"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/45 bg-white/12 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <Palette size={18} aria-hidden="true" />
              그룹 등록하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
