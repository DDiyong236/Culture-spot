import type { CreatorProject, EventType } from "@/types";

export type ArtistProfile = {
  id: string;
  name: string;
  introduction: string;
  portfolioUrl: string;
  representativeProject: CreatorProject;
  projects: CreatorProject[];
  genres: string[];
  eventTypes: EventType[];
  preferredRegions: string[];
  preferredTimes: string[];
};

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function dedupeProjects(projects: CreatorProject[]) {
  const projectMap = new Map<string, CreatorProject>();

  projects.forEach((project) => {
    if (!projectMap.has(project.id)) {
      projectMap.set(project.id, project);
    }
  });

  return Array.from(projectMap.values());
}

export function buildArtistProfiles(projects: CreatorProject[]) {
  const artistMap = new Map<string, CreatorProject[]>();

  dedupeProjects(projects).forEach((project) => {
    const artistName = project.name.trim() || project.id;
    artistMap.set(artistName, [...(artistMap.get(artistName) ?? []), project]);
  });

  return Array.from(artistMap.entries()).map<ArtistProfile>(
    ([name, artistProjects]) => {
      const representativeProject = artistProjects[0];

      return {
        id: representativeProject.id,
        name,
        introduction: representativeProject.introduction,
        portfolioUrl: representativeProject.portfolioUrl,
        representativeProject,
        projects: artistProjects,
        genres: unique(artistProjects.map((project) => project.genre)),
        eventTypes: unique(artistProjects.map((project) => project.eventType)),
        preferredRegions: unique(
          artistProjects.map((project) => project.preferredRegion),
        ),
        preferredTimes: unique(
          artistProjects.map((project) => project.preferredTime),
        ),
      };
    },
  );
}

export function findArtistProfileByProjectId(
  projects: CreatorProject[],
  projectId: string,
) {
  const foundProject = projects.find((project) => project.id === projectId);
  if (!foundProject) return null;

  return (
    buildArtistProfiles(projects).find(
      (profile) => profile.name === foundProject.name,
    ) ?? null
  );
}
