"use client";

import { SlidersHorizontal } from "lucide-react";
import type { FilterState, PriceType } from "@/types";

type FilterBarProps = {
  filters: FilterState;
  regions: string[];
  onChange: (filters: FilterState) => void;
};

const toggles: Array<{ key: keyof FilterState; label: string }> = [
  { key: "exhibition", label: "전시 가능" },
  { key: "performance", label: "공연 가능" },
  { key: "wall", label: "벽면 공간 있음" },
  { key: "noise", label: "소음 허용" },
  { key: "projector", label: "프로젝터 있음" },
  { key: "quiet", label: "조용한 분위기" },
];

export default function FilterBar({
  filters,
  regions,
  onChange,
}: FilterBarProps) {
  return (
    <aside className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-primary">
        <SlidersHorizontal size={18} aria-hidden="true" />
        <h2 className="font-bold">필터</h2>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5">
          <span className="label">지역</span>
          <select
            className="form-field"
            value={filters.region}
            onChange={(event) =>
              onChange({ ...filters, region: event.target.value })
            }
          >
            <option value="all">전체 지역</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="label">무료/유료</span>
          <select
            className="form-field"
            value={filters.priceType}
            onChange={(event) =>
              onChange({
                ...filters,
                priceType: event.target.value as "all" | PriceType,
              })
            }
          >
            <option value="all">전체</option>
            <option value="free">무료</option>
            <option value="collaboration">협업</option>
            <option value="paid">유료</option>
          </select>
        </label>

        <label className="space-y-1.5 md:col-span-2">
          <span className="label">수용 인원: 최소 {filters.capacity}명</span>
          <input
            type="range"
            min="0"
            max="40"
            step="2"
            value={filters.capacity}
            className="w-full accent-accent"
            onChange={(event) =>
              onChange({ ...filters, capacity: Number(event.target.value) })
            }
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {toggles.map((toggle) => (
          <label
            key={toggle.key}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-3 py-2 text-sm font-medium text-primary transition hover:border-accent"
          >
            <input
              type="checkbox"
              checked={Boolean(filters[toggle.key])}
              onChange={(event) =>
                onChange({ ...filters, [toggle.key]: event.target.checked })
              }
              className="size-4 rounded border-line accent-accent"
            />
            {toggle.label}
          </label>
        ))}
      </div>
    </aside>
  );
}
