import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import TitleCard from "./TitleCard";

function App() {
  const users = useQuery(api.users.list);
  const titles = useQuery(api.titles.list);
  const addTitle = useMutation(api.titles.add);

  const [currentUserId, setCurrentUserId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    await addTitle({ name, description, tags, coverUrl: coverUrl || undefined });
    setName("");
    setDescription("");
    setTagsInput("");
    setCoverUrl("");
  };

  const runSearch = async (query) => {
    const queryId = ++latestQueryId.current;
    setSearchLoading(true);

    try {
      const res = await fetch(
        `https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=5&includes[]=cover_art`
      );

      if (!res.ok) throw new Error(`MangaDex returned ${res.status}`);

      const data = await res.json();

      if (!Array.isArray(data?.data)) throw new Error("Unexpected response shape");

      const results = data.data.map((manga) => {
        const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0];
        const description = manga.attributes.description.en || "";
        const coverRel = manga.relationships.find((r) => r.type === "cover_art");
        const coverUrl = coverRel
          ? `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.256.jpg`
          : "";
        const tags = manga.attributes.tags.map((t) => t.attributes.name.en).filter(Boolean);

        return { id: manga.id, name: title, description, coverUrl, tags };
      });

      // only apply if this is still the most recent search
      if (queryId === latestQueryId.current) {
        setSearchResults(results);
      }
    } catch (err) {
      console.error("MangaDex search failed:", err);
      if (queryId === latestQueryId.current) {
        setSearchResults([]);
      }
    } finally {
      if (queryId === latestQueryId.current) {
        setSearchLoading(false);
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length < 3) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      runSearch(query);
    }, 400);
  };

  const selectSearchResult = (result) => {
    setName(result.name);
    setDescription(result.description);
    setTagsInput(result.tags.join(", "));
    setCoverUrl(result.coverUrl);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div>
      <h1>Manga Tracker</h1>

      <h2>Who are you?</h2>
      <select value={currentUserId} onChange={(e) => setCurrentUserId(e.target.value)}>
        <option value="">-- Select your name --</option>
        {users?.map((user) => (
          <option key={user._id} value={user._id}>{user.name}</option>
        ))}
      </select>
      {currentUserId && <p>Logged in as: {users?.find(u => u._id === currentUserId)?.name}</p>}

      <h2>Search MangaDex</h2>
      <input
        placeholder="Search for a title..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {searchLoading && <p>Searching...</p>}
      {searchResults.map((result) => (
        <div key={result.id} onClick={() => selectSearchResult(result)} style={{ cursor: "pointer", padding: "0.3rem", borderBottom: "1px solid #ddd" }}>
          {result.coverUrl && <img src={result.coverUrl} alt="" style={{ height: "40px", verticalAlign: "middle", marginRight: "0.5rem" }} />}
          {result.name}
        </div>
      ))}

      <h2>Add a Title</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="Title name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <input placeholder="Tags (comma separated)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </div>
        <button type="submit">Add Title</button>
      </form>

      <h2>Titles</h2>
      {titles?.map((title) => (
        <TitleCard key={title._id} title={title} currentUserId={currentUserId} users={users} />
      ))}
    </div>
  );
}

export default App;