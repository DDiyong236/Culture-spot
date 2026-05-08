"use client";

import Link from "next/link";
import { CheckCircle2, FileText, Map, Palette, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { CafeSpace, CreatorProject } from "@/types";
import {
  CAFE_APPLICATION_STORAGE_KEY,
  GROUP_CARD_STORAGE_KEY,
} from "@/lib/storageKeys";

type CafeCardActionProps = {
  cafe: Pick<CafeSpace, "id" | "name">;
};

type CafeApplication = {
  id: string;
  cafeId: string;
  cafeName: string;
  groupId: string;
  groupName: string;
  projectTitle: string;
  createdAt: string;
};

export default function CafeCardAction({ cafe }: CafeCardActionProps) {
  const { user } = useAuth();
  const [groupCards, setGroupCards] = useState<CreatorProject[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isChoosing, setIsChoosing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");
  const selectedGroup = groupCards.find((card) => card.id === selectedGroupId);

  useEffect(() => {
    if (user?.role !== "creator") return;

    try {
      const raw = window.localStorage.getItem(GROUP_CARD_STORAGE_KEY);
      const cards = raw ? (JSON.parse(raw) as CreatorProject[]) : [];
      setGroupCards(cards);
      setSelectedGroupId(cards[0]?.id ?? "");
    } catch {
      setGroupCards([]);
      setSelectedGroupId("");
    }
  }, [user?.role]);

  function applyWithSelectedGroup() {
    if (!selectedGroup) return;

    const application: CafeApplication = {
      id: `cafe-application-${Date.now()}`,
      cafeId: cafe.id,
      cafeName: cafe.name,
      groupId: selectedGroup.id,
      groupName:
        selectedGroup.name && selectedGroup.name !== "아티스트"
          ? selectedGroup.name
          : "홍길동",
      projectTitle: selectedGroup.projectTitle || "프로젝트 제목 미입력",
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = window.localStorage.getItem(CAFE_APPLICATION_STORAGE_KEY);
      const applications = raw
        ? (JSON.parse(raw) as CafeApplication[])
        : [];
      window.localStorage.setItem(
        CAFE_APPLICATION_STORAGE_KEY,
        JSON.stringify([application, ...applications]),
      );
    } catch {
      window.localStorage.setItem(
        CAFE_APPLICATION_STORAGE_KEY,
        JSON.stringify([application]),
      );
    }

    setAppliedMessage(
      `${application.projectTitle} 프로젝트로 ${cafe.name}에 신청 완료되었습니다.`,
    );
    setIsChoosing(false);
    setIsConfirming(false);
  }

  if (user?.role === "creator") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsChoosing((current) => !current)}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <Palette size={16} aria-hidden="true" />
          이 카페에 신청하기
        </button>

        {isChoosing ? (
          <div className="rounded-lg border border-line bg-background p-3">
            {groupCards.length ? (
              <div className="space-y-3">
                <label className="space-y-1.5">
                  <span className="label">신청할 프로젝트 카드</span>
                  <select
                    className="form-field"
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                  >
                    {groupCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.projectTitle || "프로젝트 제목 미입력"}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => setIsConfirming(true)}
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent/90"
                >
                  <FileText size={16} aria-hidden="true" />
                  선택한 카드로 신청 완료
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-ink/70">
                  아직 저장된 프로젝트 카드가 없습니다. 먼저 프로젝트 등록에서
                  신청할 카드를 만들어주세요.
                </p>
                <Link
                  href="/creators"
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
                >
                  프로젝트 등록으로 이동
                </Link>
              </div>
            )}
          </div>
        ) : null}

        {appliedMessage ? (
          <p className="flex items-center gap-2 rounded-lg border border-line bg-background p-3 text-sm font-bold text-primary">
            <CheckCircle2 size={16} className="text-sage" aria-hidden="true" />
            {appliedMessage}
          </p>
        ) : null}

        {isConfirming ? (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/35 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`confirm-${cafe.id}`}
          >
            <div className="w-full max-w-sm rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-accent">신청 확인</p>
              <h2 id={`confirm-${cafe.id}`} className="mt-2 text-2xl font-bold text-ink">
                찐으로 신청하겠습니까?
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                {selectedGroup?.projectTitle || "선택한 프로젝트"} 카드로 {cafe.name}에
                협업 신청을 보냅니다.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="focus-ring inline-flex flex-1 items-center justify-center rounded-lg border border-line bg-background px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={applyWithSelectedGroup}
                  className="focus-ring inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  네, 신청할게요
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (user?.role === "cafeOwner") {
    return (
      <Link
        href="/cafes/register"
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        <Store size={16} aria-hidden="true" />
        우리 카페도 등록하기
      </Link>
    );
  }

  return (
    <Link
      href={`/cafes/${cafe.id}`}
      className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
    >
      <Map size={16} aria-hidden="true" />
      카페 자세히 보기
    </Link>
  );
}
