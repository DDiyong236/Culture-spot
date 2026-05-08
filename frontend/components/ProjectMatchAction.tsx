"use client";

import Link from "next/link";
import { CheckCircle2, Music2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CafeSpace, CreatorProject } from "@/types";
import {
  CAFE_CARD_STORAGE_KEY,
} from "@/lib/storageKeys";
import {
  readProjectApplications,
  writeProjectApplications,
  type ProjectApplication,
} from "@/lib/projectApplications";

type ProjectMatchActionProps = {
  project: CreatorProject;
};

export default function ProjectMatchAction({ project }: ProjectMatchActionProps) {
  const [cafes, setCafes] = useState<CafeSpace[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");
  const selectedCafe = cafes[0];

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CAFE_CARD_STORAGE_KEY);
      const savedCafes = raw ? (JSON.parse(raw) as CafeSpace[]) : [];
      setCafes(savedCafes);
    } catch {
      setCafes([]);
    }
  }, []);

  function applyWithSelectedCafe() {
    if (!selectedCafe) return;

    const application: ProjectApplication = {
      id: `project-application-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.projectTitle || "프로젝트 제목 미입력",
      creatorName:
        project.name && project.name !== "아티스트" ? project.name : "홍길동",
      cafeId: selectedCafe.id,
      cafeName: selectedCafe.name,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    try {
      const applications = readProjectApplications();
      writeProjectApplications([application, ...applications]);
    } catch {
      writeProjectApplications([application]);
    }

    setAppliedMessage(
      `${selectedCafe.name} 정보로 ${application.projectTitle}에 신청 완료되었습니다.`,
    );
    setIsConfirming(false);
  }

  return (
    <div className="mt-auto space-y-3">
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
      >
        <Music2 size={16} aria-hidden="true" />
        협업 신청하기
      </button>

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
          aria-labelledby={`project-confirm-${project.id}`}
        >
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-accent">협업 신청 확인</p>
            <h2
              id={`project-confirm-${project.id}`}
              className="mt-2 text-2xl font-bold text-ink"
            >
              찐으로 신청하겠습니다?
            </h2>
            {selectedCafe ? (
              <p className="mt-3 text-sm leading-6 text-ink/70">
                {selectedCafe.name} 정보로 {project.projectTitle}에 협업 요청을
                보냅니다.
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/70">
                아직 등록된 카페 정보가 없습니다. 먼저 카페 정보를 등록해야
                협업 신청을 보낼 수 있습니다.
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="focus-ring inline-flex flex-1 items-center justify-center rounded-lg border border-line bg-background px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
              >
                취소
              </button>
              {selectedCafe ? (
                <button
                  type="button"
                  onClick={applyWithSelectedCafe}
                  className="focus-ring inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  네, 신청할게요
                </button>
              ) : (
                <Link
                  href="/cafes/register"
                  className="focus-ring inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  카페 등록
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
