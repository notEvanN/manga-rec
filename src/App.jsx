import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import TitleCard from "./TitleCard";

function App() {
  const users = useQuery(api.users.list);
  const addTitleWithMetadata = useMutation(api.titles.addWithMetadata);
  const searchMangaDex = useAction(api.mangadex.search);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const [sortMode, setSortMode] = useState("newest");
  const titlesNewest = useQuery(api.titles.list, sortMode !== "rating" ? {} : "skip");
  const titlesByRating = useQuery(api.titles.listSortedByRating, sortMode === "rating" ? {} : "skip");
  const rawTitles = sortMode === "rating" ? titlesByRating : titlesNewest;

  const titles = useMemo(() => {
    if (sortMode === "mostRated" && rawTitles) {
      return [...rawTitles].sort((a, b) => {
        if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
        return (b.avgRating ?? -1) - (a.avgRating ?? -1);
      });
    }
    return rawTitles;
  }, [rawTitles, sortMode]);

  const [currentUserId, setCurrentUserId] = useState("");

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);

  // modal state
  const [pendingTitle, setPendingTitle] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTagsInput, setEditedTagsInput] = useState("");
  const [initialScore, setInitialScore] = useState("");
  const [initialStatus, setInitialStatus] = useState("");
  const [isSlop, setIsSlop] = useState(false);

  const runSearch = async (query) => {
    const queryId = ++latestQueryId.current;
    setSearchLoading(true);
    try {
      const results = await searchMangaDex({ query });
      if (queryId === latestQueryId.current) setSearchResults(results);
    } catch (err) {
      console.error("MangaDex search failed:", err);
      if (queryId === latestQueryId.current) setSearchResults([]);
    } finally {
      if (queryId === latestQueryId.current) setSearchLoading(false);
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
    debounceTimer.current = setTimeout(() => runSearch(query), 400);
  };

  const openConfirmModal = (result) => {
    setPendingTitle(result);
    setEditedDescription(result.description);
    setEditedTagsInput(result.tags.join(", "));
    setInitialScore("");
    setInitialStatus("");
    setIsSlop(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  const closeModal = () => setPendingTitle(null);

  const confirmAddTitle = async () => {
    const tags = editedTagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);

    try {
      await addTitleWithMetadata({
        name: pendingTitle.name,
        description: editedDescription,
        tags,
        coverUrl: pendingTitle.coverUrl || undefined,
        userId: currentUserId || undefined,
        score: initialScore ? Number(initialScore) : undefined,
        status: initialStatus || undefined,
        slop: isSlop,
      });
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="app-header">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <h1>Manga Tracker</h1>
      </div>

      <h2>Who are you?</h2>
      <select value={currentUserId} onChange={(e) => setCurrentUserId(e.target.value)}>
        <option value="">-- Select your name --</option>
        {users?.map((user) => (
          <option key={user._id} value={user._id}>{user.name}</option>
        ))}
      </select>
      {currentUserId && <p>Logged in as: {users?.find(u => u._id === currentUserId)?.name}</p>}

      <div className="search-center">
        <h2>Search MangaDex to Add a Title</h2>
        <input
          className="search-input"
          placeholder="Search for a title..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchLoading && <p>Searching...</p>}
        {searchResults.length > 0 && (
          <div className="search-results-scroll">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => openConfirmModal(result)}
                className="search-result-row"
              >
                {result.coverUrl && (
                  <img src={result.coverUrl} alt="" referrerPolicy="no-referrer" className="search-result-thumb" />
                )}
                {result.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {pendingTitle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {pendingTitle.coverUrl && (
              <img
                src={pendingTitle.coverUrl}
                alt=""
                referrerPolicy="no-referrer"
                style={{ height: "150px", display: "block", marginBottom: "0.5rem" }}
              />
            )}
            <h3>{pendingTitle.name}</h3>

            <div>
              <label htmlFor="modal-description">Description:</label>
              <textarea
                id="modal-description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label htmlFor="modal-tags">Tags (comma separated):</label>
              <input
                id="modal-tags"
                value={editedTagsInput}
                onChange={(e) => setEditedTagsInput(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div className="status-buttons" style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setIsSlop((v) => !v)}
                className={isSlop ? "toggle-active" : ""}
              >
                {isSlop ? "✓ Slop" : "Slop?"}
              </button>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label htmlFor="modal-score">Your rating (optional): </label>
              <select id="modal-score" value={initialScore} onChange={(e) => setInitialScore(e.target.value)}>
                <option value="">-- Skip --</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-status">Your status (optional): </label>
              <select id="modal-status" value={initialStatus} onChange={(e) => setInitialStatus(e.target.value)}>
                <option value="">-- Skip --</option>
                <option value="plan_to_read">Plan to Read</option>
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button onClick={confirmAddTitle}>Add Title</button>
              <button onClick={closeModal} style={{ marginLeft: "0.5rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <h2>Titles</h2>
      <div style={{ margin: "1rem 0" }}>
        <label htmlFor="sort-mode">Sort by: </label>
        <select id="sort-mode" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="mostRated">Most Rated</option>
        </select>
      </div>
      <div className="titles-grid">
        {titles?.map((title) => (
          <TitleCard key={title._id} title={title} currentUserId={currentUserId} users={users} />
        ))}
      </div>
    </div>
  );
}

export default App;