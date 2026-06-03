export type ConceptCard = {
  id: string;
  title: string;
  type?: string;
  link?: string;
  html: string;
};

export type LinkCard = {
  id: string;
  title: string;
  type?: string;
  date?: string;
  authors?: string;
  link?: string;
  html: string;
};

type RenderOptions = {
  resolveImage?: (src: string) => string | undefined;
};

const cardLibraryHeading = /^##\s+概念卡片库\s*$/m;
const cardHeading = /^###\s+\[\[card:([^\]]+)\]\]\s*$/gm;
const linkCardHeading = /^##\s+(.+)$/gm;

function stripFrontmatter(markdown: string) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInline(markdown: string) {
  return escapeHtml(markdown)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]*)\)/g, (_match, label, href) => {
      return `<a href="${href || "#"}">${label}</a>`;
    });
}

function renderImage(src: string, alt: string, options: RenderOptions) {
  const resolvedSrc = options.resolveImage?.(src) ?? src;
  return `<figure><img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(alt)}" loading="lazy" /></figure>`;
}

function renderSimpleMarkdown(markdown: string, options: RenderOptions = {}) {
  const lines = markdown.trim().split(/\r?\n/);
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(`<ul>${list.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  const flushQuote = () => {
    if (quote.length === 0) return;
    blocks.push(`<blockquote><p>${renderInline(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };

  const flushOpenBlocks = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushOpenBlocks();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{3,6})\s+(.+)$/);
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const wikilinkImageMatch = trimmed.match(/^!\[\[([^\]]+)\]\]$/);
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const quoteMatch = trimmed.match(/^>\s?(.+)$/);

    if (headingMatch) {
      flushOpenBlocks();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (imageMatch) {
      flushOpenBlocks();
      blocks.push(renderImage(imageMatch[2].trim(), imageMatch[1].trim(), options));
      continue;
    }

    if (wikilinkImageMatch) {
      flushOpenBlocks();
      const src = wikilinkImageMatch[1].trim();
      blocks.push(renderImage(src, src, options));
      continue;
    }

    if (listMatch) {
      flushParagraph();
      flushQuote();
      list.push(listMatch[1]);
      continue;
    }

    if (quoteMatch) {
      flushParagraph();
      flushList();
      quote.push(quoteMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }

  flushOpenBlocks();

  return blocks.join("");
}

function readFields(lines: string[]) {
  const fields: Record<string, string> = {};
  const contentLines: string[] = [];
  let readingFields = true;

  for (const line of lines) {
    const fieldMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*|[\u4e00-\u9fff]+)\s*:\s*(.*)$/);

    if (readingFields && fieldMatch) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim();
      continue;
    }

    if (readingFields && line.trim() === "") {
      readingFields = false;
      continue;
    }

    readingFields = false;
    contentLines.push(line);
  }

  return { fields, contentLines };
}

function parseCardBody(body: string, fallbackTitle: string, options: RenderOptions = {}) {
  const { fields, contentLines } = readFields(body.trim().split(/\r?\n/));

  return {
    title: fields.title || fields["标题"] || fallbackTitle,
    type: fields.type || fields["类型"],
    link: fields.link || fields.url || fields["链接"],
    html: renderSimpleMarkdown(contentLines.join("\n"), options),
  };
}

export function parseConceptCards(markdown: string, options: RenderOptions = {}): ConceptCard[] {
  const content = stripFrontmatter(markdown);
  const headingMatch = content.match(cardLibraryHeading);
  if (!headingMatch || headingMatch.index === undefined) return [];

  const libraryStart = headingMatch.index + headingMatch[0].length;
  const rest = content.slice(libraryStart);
  const nextHeading = rest.search(/^##\s+/m);
  const library = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  const matches = [...library.matchAll(cardHeading)];

  return matches.map((match, index) => {
    const next = matches[index + 1];
    const id = match[1].trim();
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = next?.index ?? library.length;
    const parsed = parseCardBody(library.slice(bodyStart, bodyEnd), id, options);

    return {
      id,
      ...parsed,
    };
  });
}

export function parseLinkCards(markdown: string, options: RenderOptions = {}): LinkCard[] {
  const content = stripFrontmatter(markdown);
  const matches = [...content.matchAll(linkCardHeading)];

  return matches.map((match, index) => {
    const next = matches[index + 1];
    const id = match[1].trim();
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = next?.index ?? content.length;
    const body = content.slice(bodyStart, bodyEnd);
    const { fields, contentLines } = readFields(body.trim().split(/\r?\n/));

    return {
      id,
      title: id,
      type: fields.type || fields["类型"],
      date: fields.date || fields.published || fields.publishedat || fields["发表时间"] || fields["发表时间点"] || fields["时间"],
      authors: fields.authors || fields.author || fields["作者"],
      link: fields.link || fields.url || fields["链接"],
      html: renderSimpleMarkdown(contentLines.join("\n"), options),
    };
  });
}
