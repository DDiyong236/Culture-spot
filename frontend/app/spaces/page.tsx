"use client";

import { useEffect, useMemo, useState } from "react";
import CafeCard from "@/components/CafeCard";
import FilterBar from "@/components/FilterBar";
import { cafeSpaces, creators } from "@/data/mock";
import {
  getCafeLocation,
  getCityOptions,
  getProvinceOptions,
  getRegionOptions,
} from "@/lib/locations";
import { calculateMatchingScore } from "@/lib/matching";
import {
  fetchPlaceCities,
  fetchPlaceDistricts,
  fetchPlaceNeighborhoods,
  fetchPlaces,
} from "@/lib/placeApi";
import type { CafeSpace, FilterState } from "@/types";

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

function filterMockCafesByLocation(filters: FilterState) {
  return cafeSpaces.filter((cafe) => {
    const location = getCafeLocation(cafe);
    if (filters.province !== "all" && location.province !== filters.province) {
      return false;
    }
    if (filters.city !== "all" && location.city !== filters.city) {
      return false;
    }
    if (filters.region !== "all" && location.region !== filters.region) {
      return false;
    }
    return true;
  });
}

export default function SpacesPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [cafes, setCafes] = useState<CafeSpace[]>(cafeSpaces);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isUsingMockFallback, setIsUsingMockFallback] = useState(false);
  const [apiLocationOptions, setApiLocationOptions] = useState({
    provinces: getProvinceOptions(),
    cities: [] as string[],
    regions: [] as string[],
  });
  const sampleCreator = creators[0];

  useEffect(() => {
    let active = true;

    fetchPlaceCities()
      .then((provinces) => {
        if (!active) return;
        setApiLocationOptions((current) => ({
          ...current,
          provinces: provinces.length ? provinces : getProvinceOptions(),
        }));
      })
      .catch(() => {
        if (!active) return;
        setApiLocationOptions((current) => ({
          ...current,
          provinces: getProvinceOptions(),
        }));
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (filters.province === "all") {
      setApiLocationOptions((current) => ({
        ...current,
        cities: [],
        regions: [],
      }));
      return () => {
        active = false;
      };
    }

    fetchPlaceDistricts(filters.province)
      .then((cities) => {
        if (!active) return;
        setApiLocationOptions((current) => ({
          ...current,
          cities: cities.length ? cities : getCityOptions(filters.province),
          regions: [],
        }));
      })
      .catch(() => {
        if (!active) return;
        setApiLocationOptions((current) => ({
          ...current,
          cities: getCityOptions(filters.province),
          regions: [],
        }));
      });

    return () => {
      active = false;
    };
  }, [filters.province]);

  useEffect(() => {
    let active = true;

    if (filters.province === "all" || filters.city === "all") {
      setApiLocationOptions((current) => ({
        ...current,
        regions: [],
      }));
      return () => {
        active = false;
      };
    }

    fetchPlaceNeighborhoods(filters.province, filters.city)
      .then((regions) => {
        if (!active) return;
        setApiLocationOptions((current) => ({
          ...current,
          regions: regions.length
            ? regions
            : getRegionOptions(filters.province, filters.city),
        }));
      })
      .catch(() => {
        if (!active) return;
        setApiLocationOptions((current) => ({
          ...current,
          regions: getRegionOptions(filters.province, filters.city),
        }));
      });

    return () => {
      active = false;
    };
  }, [filters.city, filters.province]);

  useEffect(() => {
    let active = true;

    setIsLoadingPlaces(true);
    fetchPlaces({
      address1: filters.province,
      address2: filters.city,
      address3: filters.region,
    })
      .then((places) => {
        if (!active) return;
        setCafes(places);
        setIsUsingMockFallback(false);
      })
      .catch(() => {
        if (!active) return;
        setCafes(filterMockCafesByLocation(filters));
        setIsUsingMockFallback(true);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingPlaces(false);
      });

    return () => {
      active = false;
    };
  }, [filters.city, filters.province, filters.region]);

  const locationOptions = useMemo(
    () => ({
      provinces: apiLocationOptions.provinces,
      cities:
        filters.province === "all"
          ? []
          : apiLocationOptions.cities.length
            ? apiLocationOptions.cities
            : getCityOptions(filters.province),
      regions:
        filters.province === "all" || filters.city === "all"
          ? []
          : apiLocationOptions.regions.length
            ? apiLocationOptions.regions
            : getRegionOptions(filters.province, filters.city),
    }),
    [
      apiLocationOptions.cities,
      apiLocationOptions.provinces,
      apiLocationOptions.regions,
      filters.city,
      filters.province,
    ],
  );

  const filteredCafes = cafes.filter((cafe) => {
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
            카페 공간 {isLoadingPlaces ? "불러오는 중" : `${scoredCafes.length}곳`}
          </p>
          <p className="text-sm text-ink/62">
            {isUsingMockFallback
              ? "백엔드 연결 실패로 목업 데이터를 표시 중입니다."
              : `샘플 매칭: ${sampleCreator.projectTitle}, ${sampleCreator.genre}`}
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {scoredCafes.map((result) => (
            <CafeCard
              key={result.cafe.id}
              cafe={result.cafe}
              score={result.totalScore}
            />
          ))}
        </div>

        {!isLoadingPlaces && !scoredCafes.length ? (
          <div className="mt-5 rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="font-bold text-primary">
              조건에 맞는 카페 공간이 없습니다.
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              백엔드 검색 결과가 비어 있습니다. 지역 조건을 줄이거나 DB에 해당
              지역의 place 데이터가 등록되어 있는지 확인해주세요.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
