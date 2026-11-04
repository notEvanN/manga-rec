import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useUser, SignInButton, UserButton } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import TitleCard from "./TitleCard";
import TitleDetailModal from "./TitleDetailModal";
import Modal from "./Modal";
import { STATUS_OPTIONS, SCORES } from "./constants";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 400;

const SORTERS = {
  newest: null, // server already returns newest first
  rating: (a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1),
  mostRated: (a, b) => b.ratingCount - a.ratingCount || (b.avgRating ?? -1) - (a.avgRating ?? -1),
};

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const me = useQuery(api.users.me);
  const users = useQuery(api.users.list);
  const allTitles = useQuery(api.titles.list);
  const ensureUser = useMutation(api.users.ensure);
  const addTitleWithMetadata = useMutation(api.titles.addWithMetadata);
  const searchMangaDex = useAction(api.mangadex.search);

  const currentUserId = me?._id ?? "";

  // theme
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // Make sure a Convex user record exists for the signed-in Clerk user.
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
    const email = user.primaryEmailAddress?.emailAddress;
    ensureUser({ name: name || undefined, email }).catch((err) =>
      console.error("Failed to create user record:", err)
    );
  }, [isSignedIn, user, ensureUser]);

  // sorting + filtering
  const [sortMode, setSortMode] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("");
  const activeStatusFilter = currentUserId ? statusFilter : "";

  const myStatuses = useQuery(api.readStatus.mine, activeStatusFilter ? {} : "skip");

  const titles = useMemo(() => {
    if (!allTitles) return undefined;

    let result = allTitles;
    if (activeStatusFilter && myStatuses) {
      const ids = new Set(
        myStatuses.filter((s) => s.status === activeStatusFilter).map((s) => s.titleId)
      );
      result = result.filter((t) => ids.has(t._id));
    }

    const sorter = SORTERS[sortMode];
    return sorter ? [...result].sort(sorter) : result;
  }, [allTitles, sortMode, activeStatusFilter, myStatuses]);

  // detail modal: store the id so the modal always shows live data
  const [selectedTitleId, setSelectedTitleId] = useState(null);
  const selectedTitle = allTitles?.find((t) => t._id === selectedTitleId);

  // search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const runSearch = async (query) => {
    const queryId = ++latestQueryId.current;
    const isLatest = () => queryId === latestQueryId.current;
    setSearchLoading(true);
    setSearchError("");
    try {
      const results = await searchMangaDex({ query });
      if (isLatest()) setSearchResults(results);
    } catch (err) {
      console.error("MangaDex search failed:", err);
      if (isLatest()) {
        setSearchResults([]);
        setSearchError("Search failed. Please try again.");
      }
    } finally {
      if (isLatest()) setSearchLoading(false);
    }
  };

  const resetSearch = () => {
    clearTimeout(debounceTimer.current);
    latestQueryId.current++; // ignore any in-flight search
    setSearchResults([]);
    setSearchLoading(false);
    setSearchError("");
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    resetSearch();
    if (query.trim().length < MIN_SEARCH_LENGTH) return;
    debounceTimer.current = setTimeout(() => runSearch(query.trim()), SEARCH_DEBOUNCE_MS);
  };

  // add-title modal
  const [pendingTitle, setPendingTitle] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTagsInput, setEditedTagsInput] = useState("");
  const [initialScore, setInitialScore] = useState("");
  const [initialStatus, setInitialStatus] = useState("");
  const [isSlop, setIsSlop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const openConfirmModal = (result) => {
    setPendingTitle(result);
    setEditedDescription(result.description);
    setEditedTagsInput(result.tags.join(", "));
    setInitialScore("");
    setInitialStatus("");
    setIsSlop(false);
    setModalError("");
    setSearchQuery("");
    resetSearch();
  };

  const closeAddModal = () => {
    if (isSubmitting) return;
    setPendingTitle(null);
  };

  const confirmAddTitle = async () => {
    if (isSubmitting || !currentUserId) return;
    setIsSubmitting(true);
    setModalError("");

    const tags = editedTagsInput.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      await addTitleWithMetadata({
        name: pendingTitle.name,
        description: editedDescription,
        tags,
        coverUrl: pendingTitle.coverUrl || undefined,
        mangaDexId: pendingTitle.id,
        score: initialScore ? Number(initialScore) : undefined,
        status: initialStatus || undefined,
        slop: isSlop,
      });
      setPendingTitle(null);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="app-header">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <h1>Manga Tracker</h1>
        <div className="auth-section">
          {!isLoaded ? (
            <span>Loading…</span>
          ) : isSignedIn ? (
            <>
              <UserButton />
              <span>{me?.name ?? "…"}</span>
            </>
          ) : (
            <SignInButton mode="modal">
              <button>Sign In</button>
            </SignInButton>
          )}
        </div>
      </div>

      <div className="search-center">
        <h2>Search MangaDex to Add a Title</h2>
        <input
          className="search-input"
          placeholder="Search for a title..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchLoading && <p>Searching...</p>}
        {searchError && <p className="error">{searchError}</p>}
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
        <Modal onClose={closeAddModal} ariaLabel={`Add ${pendingTitle.name}`}>
          {pendingTitle.coverUrl && (
            <img src={pendingTitle.coverUrl} alt="" referrerPolicy="no-referrer" className="add-cover" />
          )}
          <h3>{pendingTitle.name}</h3>

          <div>
            <label htmlFor="modal-description">Description:</label>
            <textarea
              id="modal-description"
              className="full-width"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="modal-tags">Tags (comma separated):</label>
            <input
              id="modal-tags"
              className="full-width"
              value={editedTagsInput}
              onChange={(e) => setEditedTagsInput(e.target.value)}
            />
          </div>

          <div className="status-buttons section">
            <button
              type="button"
              onClick={() => setIsSlop((v) => !v)}
              aria-pressed={isSlop}
              className={isSlop ? "toggle-active" : ""}
            >
              {isSlop ? "✓ Slop" : "Slop?"}
            </button>
          </div>

          <div className="section">
            <label htmlFor="modal-score">Your rating (optional): </label>
            <select
              id="modal-score"
              value={initialScore}
              onChange={(e) => setInitialScore(e.target.value)}
              disabled={!currentUserId}
            >
              <option value="">-- Skip --</option>
              {SCORES.map((n) => (
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
              disabled={!currentUserId}
            >
              <option value="">-- Skip --</option>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {!currentUserId && <p className="muted">Sign in to add titles and rate them.</p>}
          {modalError && <p className="error">{modalError}</p>}

          <div className="section">
            <button onClick={confirmAddTitle} disabled={isSubmitting || !currentUserId}>
              {isSubmitting ? "Adding..." : "Add Title"}
            </button>
            <button onClick={closeAddModal} className="button-gap" disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {selectedTitle && (
        <TitleDetailModal
          key={selectedTitle._id}
          title={selectedTitle}
          currentUserId={currentUserId}
          users={users}
          onClose={() => setSelectedTitleId(null)}
        />
      )}

      <h2>Titles</h2>
      <div className="controls">
        <label htmlFor="sort-mode">Sort by: </label>
        <select id="sort-mode" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="mostRated">Most Rated</option>
        </select>

        <label htmlFor="status-filter" className="button-gap">My status: </label>
        <select
          id="status-filter"
          value={activeStatusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          disabled={!currentUserId}
        >
          <option value="">-- All --</option>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {!currentUserId && <span className="muted button-gap">(sign in to filter)</span>}
      </div>

      <div className="titles-grid">
        {titles?.map((title) => (
          <TitleCard key={title._id} title={title} onOpen={setSelectedTitleId} />
        ))}
      </div>
    </div>
  );
}

export default App;
