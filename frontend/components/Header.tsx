"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Coffee,
  LogOut,
  Map,
  Palette,
  PlusCircle,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { cn, roleLabel } from "@/lib/utils";
import type { UserRole } from "@/types";

function getNavItems(role?: UserRole) {
  const discoveryItem =
    role === "cafeOwner"
      ? { href: "/projects", label: "아티스트 프로젝트 찾기", icon: Palette }
      : { href: "/spaces", label: "공간 찾기", icon: Map };
  const baseItems = [discoveryItem];

  if (role === "creator") {
    return [
      ...baseItems,
      { href: "/creators", label: "프로젝트 등록", icon: Palette },
      { href: "/dashboard", label: "내 작업실", icon: UserRound },
    ];
  }

  if (role === "cafeOwner") {
    return [
      ...baseItems,
      { href: "/cafes/register", label: "장소 등록", icon: PlusCircle },
      { href: "/dashboard", label: "운영 화면", icon: UserRound },
    ];
  }

  if (role === "consumer") {
    return [
      ...baseItems,
      { href: "/creator-search", label: "아티스트 찾기", icon: Palette },
      { href: "/dashboard", label: "내 동네 문화", icon: UserRound },
    ];
  }

  return [
    ...baseItems,
    { href: "/creator-search", label: "아티스트 찾기", icon: Palette },
  ];
}

export default function Header() {
  const { user, hydrated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavItems(user?.role);
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  function handleLogout() {
    logout();
    router.push("/onboarding");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-ink">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-soft">
              <Coffee size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">
                컬처 SPOT!
              </span>
            </span>
          </Link>
          {hydrated && user ? (
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
              {roleLabel(user.role)}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="flex shrink-0 items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-ring inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-accent bg-white font-bold text-primary shadow-[0_0_0_3px_rgba(243,115,56,0.18)]"
                      : "border-transparent text-primary/80 hover:bg-white hover:text-primary",
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {hydrated && user ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="focus-ring inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-primary/75 transition hover:bg-white hover:text-primary"
              >
                <LogOut size={16} aria-hidden="true" />
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
            >
              <UserRound size={16} aria-hidden="true" />
              로그인/회원가입
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
