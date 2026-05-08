"use client";

import { FormEvent, useMemo, useState } from "react";
import { ImagePlus, Store } from "lucide-react";
import type {
  CafeSpace,
  Equipment,
  EventType,
  NoiseTolerance,
  PriceType,
} from "@/types";
import CafeCard from "@/components/CafeCard";
import { equipmentLabel, eventTypeLabel } from "@/lib/utils";
import { CAFE_CARD_STORAGE_KEY } from "@/lib/storageKeys";

const equipmentOptions: Equipment[] = [
  "Speaker",
  "Microphone",
  "Projector",
  "Display wall",
  "Lighting",
];

const eventOptions: EventType[] = [
  "exhibition",
  "performance",
  "pop-up",
];

type CafeFormState = {
  name: string;
  address: string;
  operatingHours: string;
  noiseTolerance: NoiseTolerance;
  seats: number;
  equipment: Equipment[];
  preferredEventTypes: EventType[];
  priceType: PriceType;
  pricePerHour: number;
  spaceImage: string;
  description: string;
};

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

export default function CafeRegisterForm() {
  const [form, setForm] = useState<CafeFormState>({
    name: "",
    address: "",
    operatingHours: "10:00 - 22:00",
    noiseTolerance: "low",
    seats: 34,
    equipment: ["Display wall", "Lighting"],
    preferredEventTypes: ["exhibition"],
    priceType: "free",
    pricePerHour: 0,
    spaceImage: "",
    description: "",
  });
  const [preview, setPreview] = useState<CafeSpace | null>(null);

  const recommendedTypes = useMemo(() => recommendEventTypes(form), [form]);

  function update<K extends keyof CafeFormState>(
    key: K,
    value: CafeFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleEquipment(item: Equipment) {
    const exists = form.equipment.includes(item);
    update(
      "equipment",
      exists
        ? form.equipment.filter((equipment) => equipment !== item)
        : [...form.equipment, item],
    );
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const availableTypes = form.preferredEventTypes.length
      ? form.preferredEventTypes
      : recommendedTypes;
    const hasWallSpace =
      availableTypes.includes("exhibition") ||
      form.equipment.includes("Display wall");
    const hasCornerSpace = availableTypes.includes("pop-up");
    const allowsPerformance =
      availableTypes.includes("performance") && form.noiseTolerance !== "low";

    const savedCafe: CafeSpace = {
      id: `registered-cafe-${Date.now()}`,
      name: form.name || "새로운 동네 카페",
      region: "등록 예정",
      address: form.address || "주소 입력 예정",
      description:
        form.description ||
        "평소 영업을 유지하면서 쓰이지 않던 공간에 작은 문화의 층을 더하는 동네 카페입니다.",
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
          ? "조용하고 카페 본연의 분위기를 살린 갤러리형 공간"
          : "따뜻하고 유연한 커뮤니티형 공간",
      image:
        form.spaceImage ||
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80",
      utilizationRate: 0,
    };

    setPreview(savedCafe);

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
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-white p-5 shadow-soft"
      >
        <div>
          <p className="text-sm font-semibold text-accent">카페 공간 레이어</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            운영 중인 카페의 작은 문화 공간을 등록하세요
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Local Stage는 카페 영업을 유지한 채, 잘 맞는 아티스트와 작은
            문화 경험이 공간 안에 자연스럽게 놓이도록 돕습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="label">카페 이름</span>
            <input
              className="form-field"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="연남 윈도우 카페"
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label">주소</span>
            <input
              className="form-field"
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
              placeholder="상세 주소"
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

        <label className="mt-4 block space-y-1.5">
          <span className="label">공간 이미지</span>
          <div className="grid gap-4 rounded-lg border border-dashed border-line bg-background p-4 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <img
                src={
                  form.spaceImage ||
                  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80"
                }
                alt="등록할 카페 공간 미리보기"
                className="h-44 w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <div className="flex items-center gap-2 text-primary">
                <ImagePlus size={18} aria-hidden="true" />
                <span className="text-sm font-bold">
                  아티스트가 확인할 공간 사진을 넣어주세요
                </span>
              </div>
              <input
                className="form-field file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) update("spaceImage", URL.createObjectURL(file));
                }}
              />
              <input
                className="form-field"
                value={form.spaceImage}
                onChange={(event) => update("spaceImage", event.target.value)}
                placeholder="또는 https:// 이미지 주소"
              />
              <p className="text-xs leading-5 text-ink/58">
                벽면, 코너, 작은 무대처럼 활용될 실제 카페 공간이 보이는
                이미지를 권장합니다.
              </p>
            </div>
          </div>
        </label>

        <fieldset className="mt-4">
          <legend className="label">사용 가능한 장비</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {equipmentOptions.map((equipment) => (
              <label
                key={equipment}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-3 py-2 text-sm font-medium text-primary"
              >
                <input
                  type="checkbox"
                  checked={form.equipment.includes(equipment)}
                  onChange={() => toggleEquipment(equipment)}
                  className="size-4 rounded border-line accent-accent"
                />
                {equipmentLabel(equipment)}
              </label>
            ))}
          </div>
        </fieldset>

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
          <span className="label">카페 설명</span>
          <textarea
            className="form-field min-h-28"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="카페의 분위기, 벽면이나 코너 상태, 일반 손님이 있는 상태에서 이벤트가 어떻게 자연스럽게 진행될 수 있는지 적어주세요."
          />
        </label>

        <button
          type="submit"
          className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          <Store size={18} aria-hidden="true" />
          등록될 카페 공간 미리보기
        </button>
      </form>

      <section className="space-y-4">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-accent">추천 적합도</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            이 카페에 어울리는 이벤트 유형
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {recommendedTypes.map((type) => (
              <span key={type} className="badge">
                {eventTypeLabel(type)}
              </span>
            ))}
          </div>
        </div>

        {preview ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <CafeCard
              cafe={preview}
              reason="이 미리보기는 아티스트에게 보일 카페 공간 카드입니다. 매칭은 카페의 평소 영업을 방해하지 않는 작은 문화 활용을 우선합니다."
            />
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-accent">공간 미리보기</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              폼을 제출하면 카페 등록 카드가 표시됩니다.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              공간 이미지, 장비, 어울리는 이벤트 유형을 미리 확인할 수
              있습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
