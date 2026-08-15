import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import TitleCard from "./TitleCard";
import TitleDetailModal from "./TitleDetailModal";
import Modal from "./Modal";

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

  const [currentUserId, setCurrentUserId] = useState(
    () => localStorage.getItem("currentUserId") || ""
  );

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem("currentUserId", currentUserId);
    } else {
      localStorage.removeItem("currentUserId");
    }
  }, [currentUserId]);

  const effectiveUserId =
    users && users.some((u) => u._id === currentUserId) ? currentUserId : "";

  const [sortMode, setSortMode] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("");

  const titlesNewest = useQuery(api.titles.list, sortMode !== "rating" ? {} : "skip");
  const titlesByRating = useQuery(api.titles.listSortedByRating, sortMode === "rating" ? {} : "skip");
  const rawTitles = sortMode === "rating" ? titlesByRating : titlesNewest;

  const userStatuses = useQuery(
    api.readStatus.forUser,
    effectiveUserId && statusFilter ? { userId: effectiveUserId } : "skip"
  );

  const titles = useMemo(() => {
    let result = rawTitles;

    if (sortMode === "mostRated" && result) {
      result = [...result].sort((a, b) => {
        if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
        return (b.avgRating ?? -1) - (a.avgRating ?? -1);
      });
    }

    if (statusFilter && userStatuses) {
      const matchingTitleIds = new Set(
        userStatuses.filter((s) => s.status === statusFilter).map((s) => s.titleId)
      );
      result = result?.filter((t) => matchingTitleIds.has(t._id));
    }

    return result;
  }, [rawTitles, sortMode, statusFilter, userStatuses]);

  // detail modal
  const [selectedTitle, setSelectedTitle] = useState(null);

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // add-title modal state
  const [pendingTitle, setPendingTitle] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTagsInput, setEditedTagsInput] = useState("");
  const [initialScore, setInitialScore] = useState("");
  const [initialStatus, setInitialStatus] = useState("");
  const [isSlop, setIsSlop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

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
    setModalError("");
    setSearchResults([]);
    setSearchQuery("");
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setPendingTitle(null);
    setModalError("");
  };

  const confirmAddTitle = async () => {
    if (isSubmitting || !effectiveUserId) return;
    setIsSubmitting(true);
    setModalError("");

    const tags = editedTagsInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0);

    try {
      await addTitleWithMetadata({
        name: pendingTitle.name,
        description: editedDescription,
        tags,
        coverUrl: pendingTitle.coverUrl || undefined,
        mangaDexId: pendingTitle.id,
        userId: effectiveUserId || undefined,
        score: initialScore ? Number(initialScore) : undefined,
        status: initialStatus || undefined,
        slop: isSlop,
      });
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
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
      {effectiveUserId && (
        <p>Logged in as: {users?.find(u => u._id === effectiveUserId)?.name}</p>
      )}

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
        <Modal onClose={closeModal} ariaLabel={`Add ${pendingTitle.name}`}>
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
              aria-pressed={isSlop}
              className={isSlop ? "toggle-active" : ""}
            >
              {isSlop ? "✓ Slop" : "Slop?"}
            </button>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <label htmlFor="modal-score">Your rating (optional): </label>
            <select
              id="modal-score"
              value={initialScore}
              onChange={(e) => setInitialScore(e.target.value)}
              disabled={!effectiveUserId}
            >
              <option value="">-- Skip --</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="modal-status">Your status (optional): </label>
            <select
              id="modal-status"
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value)}
              disabled={!effectiveUserId}
            >
              <option value="">-- Skip --</option>
              <option value="plan_to_read">Plan to Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          {!effectiveUserId && (
            <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>Select your name above to continue.</p>
          )}

          {modalError && <p style={{ color: "#ef4444" }}>{modalError}</p>}

          <div style={{ marginTop: "1rem" }}>
            <button onClick={confirmAddTitle} disabled={isSubmitting || !effectiveUserId}>
              {isSubmitting ? "Adding..." : "Add Title"}
            </button>
            <button onClick={closeModal} style={{ marginLeft: "0.5rem" }} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {selectedTitle && (
        <TitleDetailModal
          title={selectedTitle}
          currentUserId={effectiveUserId}
          users={users}
          onClose={() => setSelectedTitle(null)}
        />
      )}

      <h2>Titles</h2>
      <div style={{ margin: "1rem 0" }}>
        <label htmlFor="sort-mode">Sort by: </label>
        <select id="sort-mode" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="mostRated">Most Rated</option>
        </select>

        {" "}

        <label htmlFor="status-filter">My status: </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={!effectiveUserId}
        >
          <option value="">-- All --</option>
          <option value="plan_to_read">Plan to Read</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
        {!effectiveUserId && (
          <span style={{ fontSize: "0.8rem", opacity: 0.7, marginLeft: "0.5rem" }}>
            (select your name to filter)
          </span>
        )}
      </div>
      <div className="titles-grid">
        {titles?.map((title) => (
          <TitleCard key={title._id} title={title} onOpen={setSelectedTitle} />
        ))}
      </div>
    </div>
  );
}

export default App;