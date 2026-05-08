import type { CreatorProject } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const DEFAULT_BACKEND_BASE_URL = "http://localhost:8080";
const DEFAULT_DEMO_CREATOR_ID = 1;

type ProjectRequestBody = {
  title: string;
  eventType: string;
  genre: string;
  preferredLocation: string;
  preferredTime: string;
  portfolioUrl: string;
  description: string;
};

function buildUrl(
  path: string,
  params: Record<string, string> | undefined,
  baseUrl: string,
) {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  return url;
}

function apiUrl(path: string, params?: Record<string, string>) {
  const url = buildUrl(
    path,
    params,
    API_BASE_URL || "http://local-stage.internal",
  );

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

export function getProjectBackendLog(creatorId: number) {
  const params = { creatorId: String(creatorId) };

  return {
    browserRequestUrl: apiUrl("/projects", params),
    backendUrl: buildUrl(
      "/projects",
      params,
      API_BASE_URL || DEFAULT_BACKEND_BASE_URL,
    ).toString(),
    connectionMode: API_BASE_URL ? "direct" : "next-rewrite",
  };
}

function projectToRequestBody(project: CreatorProject): ProjectRequestBody {
  return {
    title: project.projectTitle || "프로젝트 제목 미입력",
    eventType: project.eventType,
    genre: project.genre,
    preferredLocation: project.preferredRegion,
    preferredTime: project.preferredTime,
    portfolioUrl: project.portfolioUrl,
    description: project.introduction,
  };
}

export function resolveCreatorId(userId?: string | null) {
  const numericUserId = Number(userId);
  if (Number.isFinite(numericUserId) && numericUserId > 0) {
    return numericUserId;
  }

  const demoCreatorId = Number(
    process.env.NEXT_PUBLIC_DEMO_CREATOR_ID ?? DEFAULT_DEMO_CREATOR_ID,
  );

  return Number.isFinite(demoCreatorId) && demoCreatorId > 0
    ? demoCreatorId
    : DEFAULT_DEMO_CREATOR_ID;
}

export async function registerProject(
  project: CreatorProject,
  creatorId: number,
) {
  const backendLog = getProjectBackendLog(creatorId);

  console.info("[Local Stage] 프로젝트 등록 백엔드 연결 시도", backendLog);

  const response = await fetch(backendLog.browserRequestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectToRequestBody(project)),
  });

  if (!response.ok) {
    console.error("[Local Stage] 프로젝트 등록 백엔드 응답 실패", {
      ...backendLog,
      status: response.status,
    });
    throw new Error(`Failed to register project: ${response.status}`);
  }

  console.info("[Local Stage] 연결된 백엔드", backendLog.backendUrl);

  return (await response.json()) as number;
}
