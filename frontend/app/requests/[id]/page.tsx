"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Coffee,
  MapPin,
  Palette,
} from "lucide-react";
import { cafeSpaces, creators } from "@/data/mock";
import {
  projectApplicationStatus,
  readProjectApplications,
  writeProjectApplications,
  type ProjectApplication,
} from "@/lib/projectApplications";
import {
  CAFE_CARD_STORAGE_KEY,
  GROUP_CARD_STORAGE_KEY,
} from "@/lib/storageKeys";
import { eventTypeLabel } from "@/lib/utils";
import type { CafeSpace, CreatorProject } from "@/types";

function readRegisteredCafes() {
  try {
    const raw = window.localStorage.getItem(CAFE_CARD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CafeSpace[]) : [];
  } catch {
    return [];
  }
}

function readRegisteredProjects() {
  try {
    const raw = window.localStorage.getItem(GROUP_CARD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CreatorProject[]) : [];
  } catch {
    return [];
  }
}

function formatRequestDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [application, setApplication] = useState<ProjectApplication | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const request =
      readProjectApplications().find((item) => item.id === id) ?? null;
    setApplication(request);
    setReady(true);
  }, [id]);

  const cafe = useMemo(() => {
    if (!application) return null;
    return (
      cafeSpaces.find((item) => item.id === application.cafeId) ??
      readRegisteredCafes().find((item) => item.id === application.cafeId) ??
      null
    );
  }, [application]);

  const project = useMemo(() => {
    if (!application) return null;
    return (
      creators.find((item) => item.id === application.projectId) ??
      readRegisteredProjects().find((item) => item.id === application.projectId) ??
      null
    );
  }, [application]);

  function acceptRequest() {
    if (!application) return;

    const acceptedAt = new Date().toISOString();
    const updatedApplication: ProjectApplication = {
      ...application,
      status: "accepted",
      acceptedAt,
    };
    const applications = readProjectApplications().map((item) =>
      item.id === application.id ? updatedApplication : item,
    );
    writeProjectApplications(applications);
    setApplication(updatedApplication);
  }

  if (!ready) {
    return (
      <div className="min-h-screen py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-primary">
            협업 요청을 불러오는 중입니다.
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="font-bold text-primary">협업 요청을 찾을 수 없습니다.</p>
            <Link
              href="/dashboard"
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              내 작업실로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const accepted = projectApplicationStatus(application) === "accepted";

  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-primary transition hover:border-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          내 작업실로 돌아가기
        </Link>

        <section className="mt-6 rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold text-accent">협업 요청 상세</p>
              <h1 className="mt-2 text-4xl font-bold text-ink">
                {application.cafeName}에서 보낸 요청
              </h1>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                요청일 {formatRequestDate(application.createdAt)}
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                accepted ? "bg-sage text-white" : "bg-accent text-white"
              }`}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              {accepted ? "수락됨" : "수락 대기"}
            </span>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <article className="rounded-lg border border-line bg-background p-5">
              <div className="flex items-center gap-2 text-primary">
                <Coffee size={18} aria-hidden="true" />
                <h2 className="font-bold">요청한 카페</h2>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-ink">
                {application.cafeName}
              </h3>
              {cafe ? (
                <>
                  <p className="mt-3 flex items-center gap-2 text-sm text-ink/70">
                    <MapPin size={16} className="text-sage" aria-hidden="true" />
                    {cafe.region} · {cafe.address}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink/70">
                    {cafe.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cafe.availableTimeSlots.map((slot) => (
                      <span key={slot} className="badge">
                        {slot}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-ink/70">
                  저장된 카페 상세 정보는 없지만, 요청 기록은 보관되어 있습니다.
                </p>
              )}
            </article>

            <article className="rounded-lg border border-line bg-background p-5">
              <div className="flex items-center gap-2 text-primary">
                <Palette size={18} aria-hidden="true" />
                <h2 className="font-bold">요청받은 프로젝트</h2>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-ink">
                {application.projectTitle}
              </h3>
              <p className="mt-2 text-sm font-semibold text-primary/75">
                {application.creatorName}
              </p>
              {project ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-ink/70">
                    {project.introduction}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="badge">{eventTypeLabel(project.eventType)}</span>
                    <span className="badge">{project.genre}</span>
                    <span className="badge">{project.preferredTime}</span>
                  </div>
                </>
              ) : null}
            </article>
          </div>

          <div className="mt-6 rounded-lg border border-line bg-background p-5">
            <div className="flex items-start gap-3">
              <CalendarClock size={18} className="mt-1 text-sage" aria-hidden="true" />
              <div>
                <p className="font-bold text-primary">수락 후 일정</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  수락하면 이 요청은 내 작업실의 아티스트 일정에 추가됩니다.
                  실제 날짜와 시간은 카페와 협의하는 상태로 표시됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={acceptRequest}
              disabled={accepted}
              className={`focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition ${
                accepted
                  ? "cursor-default bg-sage text-white"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              {accepted ? "이미 수락한 요청입니다" : "협업 요청 수락하기"}
            </button>
            <Link
              href="/dashboard"
              className="focus-ring inline-flex flex-1 items-center justify-center rounded-lg border border-line bg-white px-4 py-3 text-sm font-bold text-primary transition hover:border-accent"
            >
              작업실에서 일정 보기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
