"use client";

import { SlidersHorizontal } from "lucide-react";
import type { FilterState } from "@/types";

type FilterBarProps = {
  filters: FilterState;
  locationOptions: {
    provinces: string[];
    cities: string[];
    regions: string[];
  };
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
  locationOptions,
  onChange,
}: FilterBarProps) {
  return (
    <aside className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-primary">
        <SlidersHorizontal size={18} aria-hidden="true" />
        <h2 className="font-bold">필터</h2>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="space-y-1.5">
          <span className="label">도/시</span>
          <select
            className="form-field"
            value={filters.province}
            onChange={(event) =>
              onChange({
                ...filters,
                province: event.target.value,
                city: "all",
                region: "all",
              })
            }
          >
            <option value="all">전체 도/시</option>
            {locationOptions.provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="label">시/군/구</span>
          <select
            className="form-field"
            value={filters.city}
            onChange={(event) =>
              onChange({
                ...filters,
                city: event.target.value,
                region: "all",
              })
            }
          >
            <option value="all">전체 시/군/구</option>
            {locationOptions.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="label">동네</span>
          <select
            className="form-field"
            value={filters.region}
            onChange={(event) =>
              onChange({ ...filters, region: event.target.value })
            }
          >
            <option value="all">전체 동네</option>
            {locationOptions.regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
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
