import type { WikiAttachment, WikiCategory, WikiPage } from "@/types/platform";

export function getCategoryId(categoryName: string, categories: WikiCategory[] = []) {
  return categories.find((category) => category.name === categoryName)?.id;
}

export function extractHeadings(html: string) {
  if (typeof document === "undefined") return [];
  const container = document.createElement("div");
  container.innerHTML = html;
  return Array.from(container.querySelectorAll("h1,h2,h3")).map((heading, index) => ({
    id: heading.id || `section-${index}`,
    level: Number(heading.tagName.slice(1)),
    text: heading.textContent?.trim() || `Bölüm ${index + 1}`,
  }));
}

export function wikiTextMatches(page: WikiPage, query: string) {
  return `${page.title} ${page.description ?? ""} ${page.summary ?? ""} ${page.content} ${page.category}`.toLowerCase().includes(query.toLowerCase());
}

export function formatWikiSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isSafeAttachment(attachment: WikiAttachment) {
  return Boolean(attachment.name && attachment.kind && attachment.blobId);
}
