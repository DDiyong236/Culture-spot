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
  const [appliedMessage, setAppliedMessage] = useState("");

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
    const selectedGroup = groupCards.find((card) => card.id === selectedGroupId);
    if (!selectedGroup) return;

    const application: CafeApplication = {
      id: `cafe-application-${Date.now()}`,
      cafeId: cafe.id,
      cafeName: cafe.name,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name || "이름 없는 그룹",
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
      `${application.groupName} 카드로 ${cafe.name}에 신청 완료되었습니다.`,
    );
    setIsChoosing(false);
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
                  <span className="label">신청할 이력서</span>
                  <select
                    className="form-field"
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                  >
                    {groupCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {(card.name || "이름 없는 그룹") +
                          " · " +
                          (card.projectTitle || "프로젝트 제목 미입력")}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={applyWithSelectedGroup}
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent/90"
                >
                  <FileText size={16} aria-hidden="true" />
                  선택한 카드로 신청 완료
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-ink/70">
                  아직 저장된 그룹 카드가 없습니다. 먼저 그룹 등록에서 신청할
                  카드를 만들어주세요.
                </p>
                <Link
                  href="/creators"
                  className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
                >
                  그룹 등록으로 이동
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
      href="/spaces"
      className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
    >
      <Map size={16} aria-hidden="true" />
      공간 둘러보기
    </Link>
  );
}
