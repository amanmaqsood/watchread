import heat from "@/content/prepared/heat.json";
import cues from "@/content/sample/cues.json";
import provenance from "@/content/sample/provenance.json";
import generated from "@/content/sample/companion.json";
import { Project, CompanionSchema, RunSchema, validateProject } from "./domain";
export function sampleProject(): Project {
  const date = "2026-09-20T08:00:00.000Z";
  const companion = CompanionSchema.parse(generated.companion);
  const titles = [
    "A tree is made of air",
    "Two ingredients. Different jobs.",
    "From sunlight to stored energy",
  ];
  const goals = [
    "Follow the atoms. Separate matter from energy.",
    "Understand what water and carbon dioxide each contribute.",
    "Connect the two stages of photosynthesis.",
  ];
  companion.chapters.forEach((c, i) => {
    c.title = titles[i] ?? c.title;
    c.goal = goals[i] ?? c.goal;
  });
  return {
    schemaVersion: 1,
    id: "photosynthesis",
    title: "How photosynthesis actually works",
    sourceType: "sample",
    rights: "owner",
    attribution: provenance.origin,
    createdAt: date,
    updatedAt: date,
    revision: provenance.transcriptHash,
    cues,
    companion,
    attempts: [],
    media: {
      name: "lecture.mp4",
      hash: provenance.mediaHash,
      duration: provenance.duration,
      size: provenance.size,
      mime: "video/mp4",
      sampleUrl: "/sample/lecture.mp4",
    },
    run: RunSchema.parse(generated.run),
    status: "ready",
  };
}

export function preparedProject(id: string): Project | null {
  if (id === "photosynthesis") return sampleProject();
  if (id === "heat-and-touch") return validateProject(structuredClone(heat));
  return null;
}
export function preparedProjects(): Project[] {
  return [sampleProject(), preparedProject("heat-and-touch")!];
}
