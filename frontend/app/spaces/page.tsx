"use client";

import { useMemo, useState } from "react";
import CafeCard from "@/components/CafeCard";
import FilterBar from "@/components/FilterBar";
import { cafeSpaces, creators } from "@/data/mock";
import { calculateMatchingScore } from "@/lib/matching";
import { unique } from "@/lib/utils";
import type { FilterState } from "@/types";

const defaultFilters: FilterState = {
  province: "all",
  city: "all",
  region: "all",
  exhibition: false,
  performance: false,
  wall: false,
  noise: false,
  projector: false,
  quiet: false,
};

function getCafeProvince() {
  return "서울특별시";
}

function getCafeCity(address: string) {
  return address.split(" ")[0] ?? "";
}

export default function SpacesPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const sampleCreator = creators[0];

  const locationOptions = useMemo(() => {
    const cities = cafeSpaces
      .filter(
        (cafe) =>
          filters.province === "all" || getCafeProvince() === filters.province,
      )
      .map((cafe) => getCafeCity(cafe.address));
    const regions = cafeSpaces
      .filter((cafe) => {
        if (filters.province !== "all" && getCafeProvince() !== filters.province) {
          return false;
        }
        if (filters.city !== "all" && getCafeCity(cafe.address) !== filters.city) {
          return false;
        }
        return true;
      })
      .map((cafe) => cafe.region);

    return {
      provinces: ["서울특별시"],
      cities: unique(cities).sort(),
      regions: unique(regions).sort(),
    };
  }, [filters.city, filters.province]);

  const filteredCafes = cafeSpaces.filter((cafe) => {
    if (filters.province !== "all" && getCafeProvince() !== filters.province) {
      return false;
    }
    if (filters.city !== "all" && getCafeCity(cafe.address) !== filters.city) {
      return false;
    }
    if (filters.region !== "all" && cafe.region !== filters.region) return false;
    if (filters.exhibition && !cafe.availableTypes.includes("exhibition")) {
      return false;
    }
    if (filters.performance && !cafe.allowsPerformance) return false;
    if (filters.wall && !cafe.hasWallSpace) return false;
    if (filters.noise && cafe.noiseTolerance === "low") return false;
    if (filters.projector && !cafe.equipment.includes("Projector")) {
      return false;
    }
    if (
      filters.quiet &&
      cafe.noiseTolerance !== "low" &&
      !cafe.atmosphere.toLowerCase().includes("quiet") &&
      !cafe.atmosphere.includes("조용") &&
      !cafe.atmosphere.includes("차분")
    ) {
      return false;
    }
    return true;
  });

  const scoredCafes = filteredCafes
    .map((cafe) => calculateMatchingScore(sampleCreator, cafe))
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent">
            공간 탐색
          </p>
          <h1 className="mt-2 text-4xl font-bold text-ink">
            작은 문화 프로젝트에 맞는 카페 공간을 찾아보세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            운영 중인 카페 안의 벽, 코너, 한적한 시간대를 둘러보세요.
            아래 점수는 샘플 사진 전시를 기준으로 Local Stage가 공간을
            추천하는 방식을 보여줍니다.
          </p>
        </div>

        <div className="mt-8">
          <FilterBar
            filters={filters}
            locationOptions={locationOptions}
            onChange={setFilters}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-primary">
            카페 공간 {scoredCafes.length}곳
          </p>
          <p className="text-sm text-ink/62">
            샘플 매칭: {sampleCreator.projectTitle}, {sampleCreator.genre}
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {scoredCafes.map((result) => (
            <CafeCard
              key={result.cafe.id}
              cafe={result.cafe}
              score={result.totalScore}
              reason={result.recommendationReason}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
