import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import TitleCard from "./TitleCard";

function App() {
  const users = useQuery(api.users.list);
  const titles = useQuery(api.titles.list);
  const addTitle = useMutation(api.titles.add);
  const searchMangaDex = useAction(api.mangadex.search);
  const rate = useMutation(api.ratings.rate);
  const setStatus = useMutation(api.readStatus.setStatus);

  const [currentUserId, setCurrentUserId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [initialScore, setInitialScore] = useState("");
  const [initialStatus, setInitialStatus] = useState("");

  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);

    const titleId = await addTitle({ name, description, tags, coverUrl: coverUrl || undefined });

    if (currentUserId && initialScore) {
      await rate({ userId: currentUserId, titleId, score: Number(initialScore) });
    }

    if (currentUserId && initialStatus) {
      await setStatus({ userId: currentUserId, titleId, status: initialStatus });
    }

    setName("");
    setDescription("");
    setTagsInput("");
    setCoverUrl("");
    setInitialScore("");
    setInitialStatus("");
  };

  const runSearch = async (query) => {
    const queryId = ++latestQueryId.current;
    setSearchLoading(true);

    try {
      const results = await searchMangaDex({ query });

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
      <button onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
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
        <button
          key={result.id}
          onClick={() => selectSearchResult(result)}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            textAlign: "left",
            background: "none",
            border: "none",
            borderBottom: "1px solid #ddd",
            padding: "0.3rem",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          {result.coverUrl && (
            <img
              src={result.coverUrl}
              alt=""
              referrerPolicy="no-referrer"
              style={{ height: "40px", verticalAlign: "middle", marginRight: "0.5rem" }}
            />
          )}
          {result.name}
        </button>
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

        <div>
          <label>Your rating (optional): </label>
          <select value={initialScore} onChange={(e) => setInitialScore(e.target.value)}>
            <option value="">-- Skip --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Your status (optional): </label>
          <select value={initialStatus} onChange={(e) => setInitialStatus(e.target.value)}>
            <option value="">-- Skip --</option>
            <option value="plan_to_read">Plan to Read</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>

        <button type="submit">Add Title</button>
      </form>

      <h2>Titles</h2>
      <div className="titles-grid">
        {titles?.map((title) => (
          <TitleCard key={title._id} title={title} currentUserId={currentUserId} users={users} />
        ))}
      </div>
    </div>
  );
}

export default App;