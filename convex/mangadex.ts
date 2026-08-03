import { action } from "./_generated/server";
import { v } from "convex/values";

export const search = action({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let res;
    try {
      res = await fetch(
        `https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=20&includes[]=cover_art`,
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      throw new Error(`MangaDex returned ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data?.data)) {
      throw new Error("Unexpected response shape");
    }

    return data.data.map((manga: any) => {
      const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
      const description =
        manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "";
      const coverRel = manga.relationships.find((r: any) => r.type === "cover_art");
      const coverUrl = coverRel
        ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`
        : "";
      const tags = manga.attributes.tags.map((t: any) => t.attributes.name.en).filter(Boolean);

      return { id: manga.id, name: title, description, coverUrl, tags };
    });
  },
});