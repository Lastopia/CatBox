function textOf(node) {
  if (!node) return "";
  if (node.type === "text" || node.type === "inlineCode") return node.value ?? "";
  if (!Array.isArray(node.children)) return "";
  return node.children.map(textOf).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function transformTextNode(node) {
  const value = node.value ?? "";
  const pattern = /\[\[([^\]\n]+)\]\]/g;
  const nextNodes = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(value)) !== null) {
    const concept = match[1].trim();

    if (!concept || concept.startsWith("card:")) {
      continue;
    }

    if (match.index > lastIndex) {
      nextNodes.push({
        type: "text",
        value: value.slice(lastIndex, match.index),
      });
    }

    nextNodes.push({
      type: "html",
      value: `<button type="button" class="concept-trigger" data-concept="${escapeHtml(concept)}">${escapeHtml(concept)}</button>`,
    });

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex === 0) return [node];

  if (lastIndex < value.length) {
    nextNodes.push({
      type: "text",
      value: value.slice(lastIndex),
    });
  }

  return nextNodes;
}

function transformInlineConcepts(node) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = node.children.length - 1; index >= 0; index -= 1) {
    const child = node.children[index];

    if (child.type === "text") {
      node.children.splice(index, 1, ...transformTextNode(child));
      continue;
    }

    if (child.type !== "link" && child.type !== "linkReference") {
      transformInlineConcepts(child);
    }
  }
}

function removeConceptCardLibrary(tree) {
  if (!Array.isArray(tree.children)) return;

  const start = tree.children.findIndex(
    (node) => node.type === "heading" && node.depth === 2 && textOf(node).trim() === "概念卡片库",
  );

  if (start === -1) return;

  let end = tree.children.length;
  for (let index = start + 1; index < tree.children.length; index += 1) {
    const node = tree.children[index];
    if (node.type === "heading" && node.depth <= 2) {
      end = index;
      break;
    }
  }

  tree.children.splice(start, end - start);
}

export default function remarkConceptCards() {
  return (tree) => {
    removeConceptCardLibrary(tree);
    transformInlineConcepts(tree);
  };
}
