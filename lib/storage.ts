import { openDB } from "idb";
import { Project, validateProject } from "./domain";
const db = () =>
  openDB("watchread", 1, {
    upgrade(db) {
      db.createObjectStore("projects", { keyPath: "id" });
      db.createObjectStore("media");
    },
  });
export async function saveProject(p: Project) {
  const d = await db();
  await d.put("projects", p);
}
export async function loadProject(id: string) {
  const d = await db();
  const p = await d.get("projects", id);
  return p ? validateProject(p) : null;
}
export async function listProjects(): Promise<Project[]> {
  const d = await db();
  const raw = await d.getAll("projects");
  return raw
    .map(validateProject)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function saveMedia(id: string, blob: Blob) {
  const d = await db();
  await d.put("media", blob, id);
}
export async function loadMedia(id: string): Promise<Blob | undefined> {
  const d = await db();
  return d.get("media", id);
}
