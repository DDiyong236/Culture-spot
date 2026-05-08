import Link from "next/link";
import {
  CalendarDays,
  Coffee,
  LayoutDashboard,
  Map,
  Palette,
  PlusCircle,
} from "lucide-react";

const navItems = [
  { href: "/spaces", label: "공간 찾기", icon: Map },
  { href: "/creators", label: "창작자 매칭", icon: Palette },
  { href: "/cafes/register", label: "카페 등록", icon: PlusCircle },
  { href: "/events/event-rain-windows", label: "이벤트", icon: CalendarDays },
  { href: "/admin", label: "관리자", icon: LayoutDashboard },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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

        <nav className="flex flex-wrap items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary/80 transition hover:bg-white hover:text-primary"
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
