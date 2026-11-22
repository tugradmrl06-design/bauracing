import { seedData } from "@/data/seed";
import type { PlatformData } from "@/types/platform";

const STORAGE_KEY = "bau-racing-platform-data-v1";

function createId(prefix: string) {
  return `${prefix}-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`;
}

export class LocalPlatformRepository {
  private data: PlatformData;

  constructor() {
    this.data = this.load();
  }

  private load(): PlatformData {
    if (typeof window === "undefined") return structuredClone(seedData);
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = structuredClone(seedData);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      const stored = JSON.parse(raw) as PlatformData;
      stored.wikiCategoryDetails ??= structuredClone(seedData.wikiCategoryDetails);
      stored.wikiFavorites ??= [];
      stored.users ??= structuredClone(seedData.users);
      stored.membershipApplications ??= structuredClone(seedData.membershipApplications);
      stored.wikiPages = stored.wikiPages.map((page) => ({
        ...page,
        attachments: page.attachments ?? [],
        favorite: page.favorite ?? stored.wikiFavorites?.includes(page.id) ?? false,
      }));
      return stored;
    } catch {
      const initial = structuredClone(seedData);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
  }

  getData(): PlatformData {
    this.data = this.load();
    return structuredClone(this.data);
  }

  save(mutator: (draft: PlatformData) => void) {
    const draft = this.getData();
    mutator(draft);
    this.data = draft;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      window.dispatchEvent(new CustomEvent("bau-platform-data"));
    }
    return structuredClone(draft);
  }

  reset() {
    const initial = structuredClone(seedData);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    this.data = initial;
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("bau-platform-data"));
  }

  createId(prefix: string) {
    return createId(prefix);
  }
}

export const platformRepository = new LocalPlatformRepository();
