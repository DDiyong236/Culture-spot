import { PROJECT_APPLICATION_STORAGE_KEY } from "@/lib/storageKeys";

export type ProjectApplicationStatus = "pending" | "accepted";

export type ProjectApplication = {
  id: string;
  projectId: string;
  projectTitle: string;
  creatorName: string;
  cafeId: string;
  cafeName: string;
  createdAt: string;
  status?: ProjectApplicationStatus;
  acceptedAt?: string;
};

export function readProjectApplications() {
  try {
    const raw = window.localStorage.getItem(PROJECT_APPLICATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProjectApplication[]) : [];
  } catch {
    return [];
  }
}

export function writeProjectApplications(applications: ProjectApplication[]) {
  window.localStorage.setItem(
    PROJECT_APPLICATION_STORAGE_KEY,
    JSON.stringify(applications),
  );
}

export function projectApplicationStatus(application: ProjectApplication) {
  return application.status ?? "pending";
}
