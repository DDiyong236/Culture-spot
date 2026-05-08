"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const baseItems = [{ href: "/spaces", label: "공간 찾기", icon: Map }];

  if (role === "creator") {
    return [
      ...baseItems,
      { href: "/creators", label: "창작자 등록", icon: Palette },
      { href: "/dashboard", label: "내 작업실", icon: UserRound },
    ];
  }

  if (role === "cafeOwner") {
    return [
      ...baseItems,
      { href: "/cafes/register", label: "카페 등록", icon: PlusCircle },
      { href: "/dashboard", label: "운영 화면", icon: UserRound },
    ];
  }

  if (role === "consumer") {
    return [
      ...baseItems,
      { href: "/dashboard", label: "내 동네 문화", icon: UserRound },
    ];
  }

  return baseItems;
}

export default function Header() {
  const { user, hydrated, logout } = useAuth();
  const pathname = usePathname();
  const navItems = getNavItems(user?.role);
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-soft">
              <Coffee size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">
                Local Stage
              </span>
              <span className="block text-xs text-primary/70">
                카페 속 작은 문화 무대
              </span>
            </span>
          </Link>
          {hydrated && user ? (
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
              {roleLabel(user.role)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav className="flex flex-wrap items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-ring inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-accent bg-white font-bold text-primary shadow-[0_0_0_3px_rgba(217,154,61,0.18)]"
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={logout}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-primary/75 transition hover:bg-white hover:text-primary"
              >
                <LogOut size={16} aria-hidden="true" />
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
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
