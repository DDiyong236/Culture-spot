"use client";

import Link from "next/link";
import { Map, Palette, Store } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function CafeCardAction() {
  const { user } = useAuth();

  if (user?.role === "creator") {
    return (
      <Link
        href="/creators"
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        <Palette size={16} aria-hidden="true" />
        이 카페에 신청하기
      </Link>
    );
  }

  if (user?.role === "cafeOwner") {
    return (
      <Link
        href="/cafes/register"
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        <Store size={16} aria-hidden="true" />
        우리 카페도 등록하기
      </Link>
    );
  }

  return (
    <Link
      href="/spaces"
      className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
    >
      <Map size={16} aria-hidden="true" />
      공간 둘러보기
    </Link>
  );
}
