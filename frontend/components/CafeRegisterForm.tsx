"use client";

import { FormEvent, useMemo, useState } from "react";
import { ImagePlus, Link as LinkIcon, Star, Store, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  CafeSpace,
  Equipment,
  EventType,
  NoiseTolerance,
  PriceType,
} from "@/types";
import {
  getCityOptions,
  getProvinceOptions,
  getRegionOptions,
} from "@/lib/locations";
import { registerPlace } from "@/lib/placeApi";
import { eventTypeLabel } from "@/lib/utils";
import { CAFE_CARD_STORAGE_KEY } from "@/lib/storageKeys";

const eventOptions: EventType[] = [
  "exhibition",
  "performance",
  "pop-up",
];

type CafeFormState = {
  name: string;
  province: string;
  city: string;
  neighborhood: string;
  detailAddress: string;
  operatingHours: string;
  noiseTolerance: NoiseTolerance;
  seats: number;
  equipment: Equipment[];
  preferredEventTypes: EventType[];
  priceType: PriceType;
  pricePerHour: number;
  spaceImages: string[];
  spaceImageUrl: string;
  description: string;
};

const provinceOptions = getProvinceOptions();
const fallbackSpaceImage =
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80";

function buildAddress(form: CafeFormState) {
  return [
    form.province,
    form.city,
    form.neighborhood,
    form.detailAddress.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function recommendEventTypes(form: CafeFormState) {
  const recommendations = new Set<EventType>();
  if (
    form.equipment.includes("Display wall") ||
    form.equipment.includes("Projector") ||
    form.equipment.includes("Lighting")
  ) {
    recommendations.add("exhibition");
  }
  if (form.seats >= 8) {
    recommendations.add("pop-up");
  }
  if (form.noiseTolerance !== "low") {
    recommendations.add("performance");
  }
  if (!recommendations.size) recommendations.add("exhibition");
  return Array.from(recommendations);
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function CafeRegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<CafeFormState>({
    name: "",
    province: "",
    city: "",
    neighborhood: "",
    detailAddress: "",
    operatingHours: "10:00 - 22:00",
    noiseTolerance: "low",
    seats: 34,
    equipment: ["Display wall", "Lighting"],
    preferredEventTypes: ["exhibition"],
    priceType: "free",
    pricePerHour: 0,
    spaceImages: [],
    spaceImageUrl: "",
    description: "",
  });

  const cityOptions = useMemo(
    () => (form.province ? getCityOptions(form.province) : []),
    [form.province],
  );
  const neighborhoodOptions = useMemo(
    () =>
      form.province && form.city
        ? getRegionOptions(form.province, form.city)
        : [],
    [form.city, form.province],
  );

  function update<K extends keyof CafeFormState>(
    key: K,
    value: CafeFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleEventType(type: EventType) {
    const exists = form.preferredEventTypes.includes(type);
    update(
      "preferredEventTypes",
      exists
        ? form.preferredEventTypes.filter((eventType) => eventType !== type)
        : [...form.preferredEventTypes, type],
    );
  }

  function addSpaceImageUrl() {
    const nextImage = form.spaceImageUrl.trim();
    if (!nextImage) return;

    addSpaceImages([nextImage]);
  }

  function addSpaceImages(images: string[]) {
    setForm((current) => ({
      ...current,
      spaceImages: Array.from(new Set([...current.spaceImages, ...images])),
      spaceImageUrl: "",
    }));
  }

  function removeSpaceImage(image: string) {
    setForm((current) => ({
      ...current,
      spaceImages: current.spaceImages.filter((item) => item !== image),
    }));
  }

  function makeRepresentativeImage(image: string) {
    setForm((current) => ({
      ...current,
      spaceImages: [
        image,
        ...current.spaceImages.filter((item) => item !== image),
      ],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const address = buildAddress(form);
    const availableTypes = form.preferredEventTypes.length
      ? form.preferredEventTypes
      : recommendEventTypes(form);
    const hasWallSpace =
      availableTypes.includes("exhibition") ||
      form.equipment.includes("Display wall");
    const hasCornerSpace = availableTypes.includes("pop-up");
    const allowsPerformance =
      availableTypes.includes("performance") && form.noiseTolerance !== "low";
    const spaceImages = form.spaceImages.length
      ? form.spaceImages
      : [fallbackSpaceImage];

    try {
      setIsSubmitting(true);
      const description =
        form.description ||
        "평소 영업을 유지하면서 쓰이지 않던 공간에 작은 문화의 층을 더하는 동네 소상공인 공간입니다.";
      const placeId = await registerPlace({
        title: form.name || "새로운 동네 장소",
        description,
        address1: form.province || "미입력",
        address2: form.city || "미입력",
        address3: form.neighborhood || "미입력",
        address4: form.detailAddress.trim() || "상세주소 미입력",
        openinghours: form.operatingHours || null,
        seatCount: Math.max(1, form.seats),
        allowSound: form.noiseTolerance,
        pricingType: form.priceType === "paid",
        thumbnailUrl: spaceImages[0] ?? null,
        spaceUrl: JSON.stringify(spaceImages),
        preferedEventTypes: availableTypes,
      });

      const savedCafe: CafeSpace = {
        id: `backend-place-${placeId}`,
        name: form.name || "새로운 동네 장소",
        region: form.neighborhood || form.city || "등록 예정",
        address: address || "주소 입력 예정",
        description,
        availableTypes,
        capacity: Math.max(6, Math.min(form.seats, 24)),
        seats: form.seats,
        operatingHours: form.operatingHours,
        availableTimeSlots: [
          form.operatingHours ? `${form.operatingHours} 중 협의` : "운영 중 협의",
        ],
        hasWallSpace,
        hasCornerSpace,
        allowsPerformance,
        noiseTolerance: form.noiseTolerance,
        equipment: form.equipment,
        priceType: form.priceType,
        pricePerHour: form.priceType === "paid" ? form.pricePerHour : 0,
        atmosphere:
          form.noiseTolerance === "low"
            ? "조용하고 매장 본연의 분위기를 살린 갤러리형 공간"
            : "따뜻하고 유연한 커뮤니티형 공간",
        image: spaceImages[0],
        images: spaceImages,
        utilizationRate: 0,
      };

      try {
        const raw = window.localStorage.getItem(CAFE_CARD_STORAGE_KEY);
        const cafes = raw ? (JSON.parse(raw) as CafeSpace[]) : [];
        window.localStorage.setItem(
          CAFE_CARD_STORAGE_KEY,
          JSON.stringify([savedCafe, ...cafes]),
        );
      } catch {
        window.localStorage.setItem(
          CAFE_CARD_STORAGE_KEY,
          JSON.stringify([savedCafe]),
        );
      }

      router.push("/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "공간 등록 중 문제가 발생했습니다.",
      );
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-white p-5 shadow-soft"
      >
        <div>
          <p className="text-sm font-semibold text-accent">소상공인 공간 레이어</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            운영 중인 장소의 작은 문화 공간을 등록하세요
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            컬처 SPOT!은 동네 가게, 공방, 서점, 편집숍처럼 소상공인이
            운영하는 공간에 잘 맞는 아티스트와 작은 문화 경험을 연결합니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="label">장소명</span>
            <input
              className="form-field"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="연남 작은가게"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">도/시</span>
            <select
              className="form-field"
              value={form.province}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  province: event.target.value,
                  city: "",
                  neighborhood: "",
                }))
              }
            >
              <option value="">도/시 선택</option>
              {provinceOptions.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label">시군구</span>
            <select
              className="form-field"
              value={form.city}
              disabled={!form.province}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  city: event.target.value,
                  neighborhood: "",
                }))
              }
            >
              <option value="">
                {form.province ? "시군구 선택" : "도/시를 먼저 선택"}
              </option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label">동</span>
            <select
              className="form-field"
              value={form.neighborhood}
              disabled={!form.province || !form.city}
              onChange={(event) => update("neighborhood", event.target.value)}
            >
              <option value="">
                {form.city ? "동 선택" : "시군구를 먼저 선택"}
              </option>
              {neighborhoodOptions.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label">상세주소</span>
            <input
              className="form-field"
              value={form.detailAddress}
              onChange={(event) => update("detailAddress", event.target.value)}
              placeholder="동교로38길 24, 2층"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">운영 시간</span>
            <input
              className="form-field"
              value={form.operatingHours}
              onChange={(event) => update("operatingHours", event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">좌석 수</span>
            <input
              className="form-field"
              type="number"
              min="1"
              value={form.seats}
              onChange={(event) => update("seats", Number(event.target.value))}
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">소음 허용 수준</span>
            <select
              className="form-field"
              value={form.noiseTolerance}
              onChange={(event) =>
                update("noiseTolerance", event.target.value as NoiseTolerance)
              }
            >
              <option value="low">낮음: 조용한 분위기 유지</option>
              <option value="medium">보통: 짧은 토크나 어쿠스틱 가능</option>
              <option value="high">높음: 공연 사운드도 유연하게 가능</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="label">가격 또는 협업 방식</span>
            <select
              className="form-field"
              value={form.priceType}
              onChange={(event) =>
                update("priceType", event.target.value as PriceType)
              }
            >
              <option value="free">무료</option>
              <option value="paid">유료</option>
            </select>
          </label>
          {form.priceType === "paid" ? (
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="label">시간당 금액</span>
              <input
                className="form-field"
                type="number"
                min="0"
                step="5000"
                value={form.pricePerHour}
                onChange={(event) =>
                  update("pricePerHour", Number(event.target.value))
                }
              />
            </label>
          ) : null}
        </div>

        <div className="mt-4 space-y-1.5">
          <span className="label">공간 이미지</span>
          <div className="grid gap-4 rounded-lg border border-dashed border-line bg-background p-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="relative min-h-64 overflow-hidden rounded-lg border border-line bg-white">
              {form.spaceImages[0] ? (
                <>
                  <img
                    src={form.spaceImages[0]}
                    alt="대표로 등록할 장소 사진"
                    className="h-full min-h-64 w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16 text-white">
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-primary">
                      <Star size={13} className="fill-current" aria-hidden="true" />
                      대표 이미지
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      장소 카드와 상세 화면에 먼저 표시됩니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpaceImage(form.spaceImages[0])}
                    className="focus-ring absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1.5 text-xs font-bold text-primary shadow-sm transition hover:bg-white"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    삭제
                  </button>
                </>
              ) : (
                <label
                  htmlFor="cafe-space-images"
                  className="focus-ring flex h-full min-h-64 cursor-pointer flex-col items-center justify-center gap-3 p-6 text-center text-primary transition hover:bg-white"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-mist">
                    <ImagePlus size={24} aria-hidden="true" />
                  </span>
                  <span className="text-base font-bold">공간 사진 추가</span>
                  <span className="text-sm leading-6 text-ink/62">
                    매장 전면, 벽면, 좌석, 진열대처럼 실제로 사용할 공간이
                    보이는 사진을 넣어주세요.
                  </span>
                </label>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <ImagePlus size={18} aria-hidden="true" />
                  <span className="text-sm font-bold">
                    {form.spaceImages.length
                      ? `${form.spaceImages.length}장 선택됨`
                      : "사진을 선택해 주세요"}
                  </span>
                </div>
                <label
                  htmlFor="cafe-space-images"
                  className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  <ImagePlus size={16} aria-hidden="true" />
                  사진 선택
                </label>
              </div>

              <input
                id="cafe-space-images"
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (!files.length) return;
                  const imageUrls = await Promise.all(files.map(readImageFile));
                  addSpaceImages(imageUrls);
                  event.target.value = "";
                }}
              />

              {form.spaceImages.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {form.spaceImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="group relative overflow-hidden rounded-lg border border-line bg-white"
                    >
                      <img
                        src={image}
                        alt={`등록할 장소 사진 ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                      {index === 0 ? (
                        <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
                          대표
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeRepresentativeImage(image)}
                          className="focus-ring absolute left-2 top-2 rounded-full bg-white/92 px-2 py-0.5 text-[11px] font-bold text-primary shadow-sm transition hover:bg-white"
                        >
                          대표로
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSpaceImage(image)}
                        className="focus-ring absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-white/92 text-primary shadow-sm transition hover:bg-white"
                        aria-label={`공간 사진 ${index + 1} 삭제`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-line bg-white p-4 text-sm leading-6 text-ink/62">
                  사진을 넣지 않으면 기본 장소 이미지가 임시로 사용됩니다.
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <label className="relative">
                  <LinkIcon
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/55"
                    aria-hidden="true"
                  />
                  <input
                    className="form-field pl-9"
                    value={form.spaceImageUrl}
                    onChange={(event) => update("spaceImageUrl", event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      addSpaceImageUrl();
                    }}
                    placeholder="https:// 이미지 주소"
                  />
                </label>
                <button
                  type="button"
                  onClick={addSpaceImageUrl}
                  className="focus-ring rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-primary transition hover:border-accent"
                >
                  주소 추가
                </button>
              </div>

              <p className="text-xs leading-5 text-ink/58">
                첫 번째 사진이 대표 이미지로 사용됩니다. 썸네일의 대표로 버튼을
                누르면 순서를 바꿀 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="label">희망 이벤트 유형</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {eventOptions.map((eventType) => (
              <label
                key={eventType}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-3 py-2 text-sm font-medium capitalize text-primary"
              >
                <input
                  type="checkbox"
                  checked={form.preferredEventTypes.includes(eventType)}
                  onChange={() => toggleEventType(eventType)}
                  className="size-4 rounded border-line accent-accent"
                />
                {eventTypeLabel(eventType)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block space-y-1.5">
          <span className="label">장소 설명</span>
          <textarea
            className="form-field min-h-28"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="매장의 분위기, 벽면이나 코너 상태, 손님이 오가는 중에도 문화 활동이 자연스럽게 놓일 수 있는 방식을 적어주세요."
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/55"
        >
          <Store size={18} aria-hidden="true" />
          {isSubmitting ? "등록 중..." : "바로 등록하기"}
        </button>
        {submitError ? (
          <p className="mt-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-primary">
            {submitError}
          </p>
        ) : null}
      </form>
    </div>
  );
}
