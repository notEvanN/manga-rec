import { action } from "./_generated/server";
import { v } from "convex/values";

const API_URL = "https://api.mangadex.org";
const TIMEOUT_MS = 8000;

async function fetchMangaDex(path: string) {
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
function localized(map: Record<string, string> | undefined) {
  if (!map) return undefined;
  return map.en || Object.values(map)[0];
}

export const search = action({
  args: { query: v.string() },
  handler: async (_ctx, { query }) => {
    const results = await fetchMangaDex(
      `/manga?title=${encodeURIComponent(query)}&limit=20&includes[]=cover_art`
    );

    return results.map((manga: any) => {
      const attrs = manga.attributes ?? {};
      const coverFile = manga.relationships?.find((r: any) => r.type === "cover_art")
        ?.attributes?.fileName;

      return {
        id: manga.id,
        name: localized(attrs.title) || "Untitled",
        description: localized(attrs.description) || "",
        coverUrl: coverFile
          ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`
          : "",
        tags: (attrs.tags ?? []).map((t: any) => t.attributes?.name?.en).filter(Boolean),
      };
    });
  },
});

export const latestChapter = action({
  args: { mangaDexId: v.string() },
  handler: async (_ctx, { mangaDexId }) => {
    const chapters = await fetchMangaDex(
      `/manga/${encodeURIComponent(mangaDexId)}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=1` +
        `&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`
    );
    return chapters[0]?.attributes?.chapter || null;
  },
});
