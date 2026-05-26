export const notebooks = [
  {
    name: "学习笔记",
    slug: "learning",
    description: "记录编程、工具、语言和其他学习过程中的整理。",
  },
  {
    name: "生活随想",
    slug: "life",
    description: "放一些日常想法、观察、灵感和碎片记录。",
  },
  {
    name: "项目记录",
    slug: "projects",
    description: "以后可以记录猫箱本身，以及你做过的其他项目。",
  },
];

export function getNotebook(slug: string) {
  return notebooks.find((notebook) => notebook.slug === slug);
}
