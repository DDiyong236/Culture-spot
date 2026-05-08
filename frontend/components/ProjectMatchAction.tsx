"use client";

import Link from "next/link";
import { CheckCircle2, Music2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import type { CafeSpace, CreatorProject } from "@/types";
import {
  CAFE_CARD_STORAGE_KEY,
  PROJECT_APPLICATION_STORAGE_KEY,
} from "@/lib/storageKeys";

type ProjectMatchActionProps = {
  project: CreatorProject;
};

type ProjectApplication = {
  id: string;
  projectId: string;
  projectTitle: string;
  creatorName: string;
  cafeId: string;
  cafeName: string;
  createdAt: string;
};

export default function ProjectMatchAction({ project }: ProjectMatchActionProps) {
  const [cafes, setCafes] = useState<CafeSpace[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState("");
  const [isChoosing, setIsChoosing] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CAFE_CARD_STORAGE_KEY);
      const savedCafes = raw ? (JSON.parse(raw) as CafeSpace[]) : [];
      setCafes(savedCafes);
      setSelectedCafeId(savedCafes[0]?.id ?? "");
    } catch {
      setCafes([]);
      setSelectedCafeId("");
    }
  }, []);

  function applyWithSelectedCafe() {
    const selectedCafe = cafes.find((cafe) => cafe.id === selectedCafeId);
    if (!selectedCafe) return;

    const application: ProjectApplication = {
      id: `project-application-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.projectTitle || "프로젝트 제목 미입력",
      creatorName: project.name || "이름 없는 그룹",
      cafeId: selectedCafe.id,
      cafeName: selectedCafe.name,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = window.localStorage.getItem(PROJECT_APPLICATION_STORAGE_KEY);
      const applications = raw
        ? (JSON.parse(raw) as ProjectApplication[])
        : [];
      window.localStorage.setItem(
        PROJECT_APPLICATION_STORAGE_KEY,
        JSON.stringify([application, ...applications]),
      );
    } catch {
      window.localStorage.setItem(
        PROJECT_APPLICATION_STORAGE_KEY,
        JSON.stringify([application]),
      );
    }

    setAppliedMessage(
      `${selectedCafe.name} 정보로 ${application.projectTitle}에 신청 완료되었습니다.`,
    );
    setIsChoosing(false);
  }

  return (
    <div className="mt-auto space-y-3">
      <button
        type="button"
        onClick={() => setIsChoosing((current) => !current)}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
      >
        <Music2 size={16} aria-hidden="true" />
        우리 카페와 맞춰보기
      </button>

      {isChoosing ? (
        <div className="rounded-lg border border-line bg-background p-3">
          {cafes.length ? (
            <div className="space-y-3">
              <label className="space-y-1.5">
                <span className="label">보낼 카페 정보</span>
                <select
                  className="form-field"
                  value={selectedCafeId}
                  onChange={(event) => setSelectedCafeId(event.target.value)}
                >
                  {cafes.map((cafe) => (
                    <option key={cafe.id} value={cafe.id}>
                      {cafe.name} · {cafe.address}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={applyWithSelectedCafe}
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent/90"
              >
                <Send size={16} aria-hidden="true" />
                선택한 카페로 신청 완료
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-ink/70">
                아직 등록된 카페 정보가 없습니다. 카페 등록을 완료하면 이곳에서
                기존 카페 정보를 보내 신청할 수 있습니다.
              </p>
              <Link
                href="/cafes/register"
                className="focus-ring inline-flex w-full items-center justify-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
              >
                카페 정보 등록하기
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
