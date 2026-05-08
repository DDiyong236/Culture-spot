"use client";

import { FormEvent, useMemo, useState } from "react";
import { Store } from "lucide-react";
import type {
  CafeSpace,
  Equipment,
  EventType,
  NoiseTolerance,
  PriceType,
} from "@/types";
import CafeCard from "@/components/CafeCard";
import { equipmentLabel, eventTypeLabel } from "@/lib/utils";

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
  "book talk",
];

type CafeFormState = {
  name: string;
  address: string;
  region: string;
  operatingHours: string;
  idleTimeSlots: string;
  hasWallSpace: boolean;
  hasCornerSpace: boolean;
  allowsPerformance: boolean;
  noiseTolerance: NoiseTolerance;
  seats: number;
  capacity: number;
  equipment: Equipment[];
  preferredEventTypes: EventType[];
  priceType: PriceType;
  pricePerHour: number;
  description: string;
};

function recommendEventTypes(form: CafeFormState) {
  const recommendations = new Set<EventType>();
  if (form.hasWallSpace || form.equipment.includes("Display wall")) {
    recommendations.add("exhibition");
  }
  if (form.hasCornerSpace) {
    recommendations.add("pop-up");
    recommendations.add("book talk");
  }
  if (form.allowsPerformance && form.noiseTolerance !== "low") {
    recommendations.add("performance");
  }
  if (!recommendations.size) recommendations.add("book talk");
  return Array.from(recommendations);
}

export default function CafeRegisterForm() {
  const [form, setForm] = useState<CafeFormState>({
    name: "",
    address: "",
    region: "연남",
    operatingHours: "10:00 - 22:00",
    idleTimeSlots: "평일 오후",
    hasWallSpace: true,
    hasCornerSpace: true,
    allowsPerformance: false,
    noiseTolerance: "low",
    seats: 34,
    capacity: 22,
    equipment: ["Display wall", "Lighting"],
    preferredEventTypes: ["exhibition", "book talk"],
    priceType: "collaboration",
    pricePerHour: 0,
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

  function updateAvailability(
    key: "hasWallSpace" | "hasCornerSpace" | "allowsPerformance",
    value: boolean,
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const availableTypes = form.preferredEventTypes.length
      ? form.preferredEventTypes
      : recommendedTypes;

    setPreview({
      id: "preview-cafe",
      name: form.name || "새로운 동네 카페",
      region: form.region,
      address: form.address || "주소 입력 예정",
      description:
        form.description ||
        "평소 영업을 유지하면서 쓰이지 않던 공간에 작은 문화의 층을 더하는 동네 카페입니다.",
      availableTypes,
      capacity: form.capacity,
      seats: form.seats,
      availableTimeSlots: form.idleTimeSlots
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean),
      hasWallSpace: form.hasWallSpace,
      hasCornerSpace: form.hasCornerSpace,
      allowsPerformance: form.allowsPerformance,
      noiseTolerance: form.noiseTolerance,
      equipment: form.equipment,
      priceType: form.priceType,
      pricePerHour: form.priceType === "paid" ? form.pricePerHour : 0,
      atmosphere:
        form.noiseTolerance === "low"
          ? "조용하고 카페 본연의 분위기를 살린 갤러리형 공간"
          : "따뜻하고 유연한 커뮤니티형 공간",
      image:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80",
      utilizationRate: 0,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-white p-5 shadow-soft"
      >
        <div>
          <p className="text-sm font-semibold text-accent">카페 공간 레이어</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            쓰이지 않던 벽, 코너, 한적한 시간을 등록하세요
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Local Stage는 카페 영업을 유지한 채, 잘 맞는 창작자와 작은
            문화 경험이 공간 안에 자연스럽게 놓이도록 돕습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="label">카페 이름</span>
            <input
              className="form-field"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="연남 윈도우 카페"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">지역</span>
            <input
              className="form-field"
              value={form.region}
              onChange={(event) => update("region", event.target.value)}
              placeholder="연남"
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
            <span className="label">한적한 시간대</span>
            <input
              className="form-field"
              value={form.idleTimeSlots}
              onChange={(event) => update("idleTimeSlots", event.target.value)}
              placeholder="평일 오후, 일요일 오전"
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
            <span className="label">소규모 이벤트 수용 인원</span>
            <input
              className="form-field"
              type="number"
              min="1"
              value={form.capacity}
              onChange={(event) => update("capacity", Number(event.target.value))}
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
              <option value="collaboration">무료 협업</option>
              <option value="paid">유료</option>
            </select>
          </label>
          {form.priceType === "paid" ? (
            <label className="space-y-1.5 sm:col-span-2">
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

        <fieldset className="mt-4">
          <legend className="label">공간 활용 가능 여부</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["hasWallSpace", "벽면 사용 가능"],
              ["hasCornerSpace", "코너 공간 사용 가능"],
              ["allowsPerformance", "공연 가능"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-background px-3 py-2 text-sm font-medium text-primary"
              >
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof CafeFormState])}
                  onChange={(event) =>
                    updateAvailability(
                      key as "hasWallSpace" | "hasCornerSpace" | "allowsPerformance",
                      event.target.checked,
                    )
                  }
                  className="size-4 rounded border-line accent-accent"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

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
              <span key={type} className="badge capitalize">
                {type}
              </span>
            ))}
          </div>
        </div>

        {preview ? (
          <CafeCard
            cafe={preview}
            reason="이 미리보기는 창작자에게 보일 카페 공간 카드입니다. 매칭은 카페의 평소 영업을 방해하지 않는 작은 문화 활용을 우선합니다."
          />
        ) : (
          <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-accent">공간 미리보기</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              폼을 제출하면 카페 등록 카드가 표시됩니다.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              활용 가능한 문화 공간, 한적한 시간대, 장비, 어울리는 이벤트
              유형을 미리 확인할 수 있습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
