import type { CreatorProject } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
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

function apiUrl(path: string, params?: Record<string, string>) {
  const url = new URL(path, API_BASE_URL || "http://local-stage.internal");

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

function projectToRequestBody(project: CreatorProject): ProjectRequestBody {
  return {
    title: project.projectTitle || "활동 제목 미입력",
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

export async function registerProjectActivity(
  project: CreatorProject,
  creatorId: number,
) {
  const response = await fetch(
    apiUrl("/projects", { creatorId: String(creatorId) }),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectToRequestBody(project)),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to register project: ${response.status}`);
  }

  return (await response.json()) as number;
}
