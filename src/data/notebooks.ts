const noteModules = import.meta.glob("../content/notes/**/*.md", { eager: true });

export const notebooks = Array.from(
  new Set(
    Object.keys(noteModules)
      .map((path) => path.replace("../content/notes/", "").split("/")[0])
      .filter(Boolean),
  ),
)
  .sort((a, b) => a.localeCompare(b, "zh-CN"))
  .map((name) => ({
    name,
    slug: name,
    description: `${name} 下的笔记。`,
  }));

export function getNotebook(slug: string) {
  return notebooks.find((notebook) => notebook.slug === slug);
}
