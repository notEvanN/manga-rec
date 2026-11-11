import { action } from "./_generated/server";
import { v } from "convex/values";

const API_URL = "https://api.mangadex.org";
const TIMEOUT_MS = 8000;

// The parts of MangaDex API responses we read. Everything is optional because we don't control it.
// See https://api.mangadex.org/docs/
type LocalizedString = Record<string, string>;

type MangaDexManga = {
  id: string;
  attributes?: {
    title?: LocalizedString;
    description?: LocalizedString;
    tags?: { attributes?: { name?: LocalizedString } }[];
  };
  relationships?: { type: string; attributes?: { fileName?: string } }[];
};

type MangaDexChapter = {
  attributes?: { chapter?: string | null };
};

async function fetchMangaDex<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API_URL}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`MangaDex returned ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data?.data)) {
    throw new Error("Unexpected response shape from MangaDex");
  }
  return data.data;
}

// Picks the English value from a MangaDex localized string map, else the first one.
function localized(map: LocalizedString | undefined) {
  if (!map) return undefined;
  return map.en || Object.values(map)[0];
}

export const search = action({
  args: { query: v.string() },
  handler: async (_ctx, { query }) => {
    const results = await fetchMangaDex<MangaDexManga>(
      `/manga?title=${encodeURIComponent(query)}&limit=20&includes[]=cover_art`,
    );

    return results.map((manga) => {
      const attrs = manga.attributes ?? {};
      const coverFile = manga.relationships?.find((r) => r.type === "cover_art")?.attributes
        ?.fileName;

      return {
        id: manga.id,
        name: localized(attrs.title) || "Untitled",
        description: localized(attrs.description) || "",
        coverUrl: coverFile
          ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`
          : "",
        tags: (attrs.tags ?? [])
          .map((t) => t.attributes?.name?.en)
          .filter((tag): tag is string => Boolean(tag)),
      };
    });
  },
});

export const latestChapter = action({
  args: { mangaDexId: v.string() },
  handler: async (_ctx, { mangaDexId }) => {
    const chapters = await fetchMangaDex<MangaDexChapter>(
      `/manga/${encodeURIComponent(mangaDexId)}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=1` +
        `&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`,
    );
    return chapters[0]?.attributes?.chapter || null;
  },
});
