import { readdirSync } from "node:fs";
import { join } from "node:path";

const notesDir = join(process.cwd(), "src", "content", "notes");

export const notebooks = readdirSync(notesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, "zh-CN"))
  .map((name) => ({
    name,
    slug: name,
    description: `${name} 下的笔记。`,
  }));

export function getNotebook(slug: string) {
  return notebooks.find((notebook) => notebook.slug === slug);
}
