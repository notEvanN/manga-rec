import { useState, useRef, useEffect, useMemo, useId } from "react";
import { useAction, useConvexAuth } from "convex/react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  InputAdornment,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../../convex/_generated/api";
import CoverPlaceholder from "./CoverPlaceholder";

const MIN_SHELF_LENGTH = 2;
const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 400;
const MAX_SHELF_MATCHES = 5;

// Case- and accent-insensitive, so "kamuy" finds "Golden Kamuy" and "pokemon" finds "Pokémon".
const fold = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

function isTypingTarget(el) {
  return el?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName);
}

function ShelfThumb({ title }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        width: 32,
        height: 48,
        flexShrink: 0,
        mr: 1.5,
        borderRadius: "6px",
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      <CoverPlaceholder name={title.name} showName={false} />
      {title.coverUrl && (
        <Box
          component="img"
          src={title.coverUrl}
          alt=""
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </Box>
  );
}

const groupLabelSx = {
  px: 2,
  pt: 1.5,
  pb: 0.5,
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "text.secondary",
};

// One search box for the group's list and MangaDex. Titles already on the list open straight
// away (onOpen); new ones go to the add dialog (onPick). Arrow keys move through the results, and
// "/" anywhere on the page jumps here.
function TitleSearch({ titles, onOpen, onPick }) {
  const searchMangaDex = useAction(api.mangadex.search);
  const { isAuthenticated } = useConvexAuth(); // MangaDex search is signed-in only
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchedFor, setSearchedFor] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(document.activeElement)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const trimmed = query.trim();

  // Shelf section: name matches, plus MangaDex results the group already has.
  // MangaDex section: everything else MangaDex found.
  const { shelf, fresh } = useMemo(() => {
    if (!titles || trimmed.length < MIN_SHELF_LENGTH) return { shelf: [], fresh: results };

    const needle = fold(trimmed);
    const byName = titles
      .filter((t) => fold(t.name).includes(needle))
      .sort((a, b) => fold(b.name).startsWith(needle) - fold(a.name).startsWith(needle))
      .slice(0, MAX_SHELF_MATCHES);

    const byMangaDexId = new Map(titles.filter((t) => t.mangaDexId).map((t) => [t.mangaDexId, t]));
    const shelfIds = new Set(byName.map((t) => t._id));
    const alreadyListed = results
      .map((r) => byMangaDexId.get(r.id))
      .filter((t) => t && !shelfIds.has(t._id));

    return {
      shelf: [...byName, ...alreadyListed],
      fresh: results.filter((r) => !byMangaDexId.has(r.id)),
    };
  }, [titles, trimmed, results]);

  const options = [
    ...shelf.map((title) => ({ key: `shelf-${title._id}`, title })),
    ...fresh.map((result) => ({ key: `md-${result.id}`, result })),
  ];
  const noMatch = searchedFor && options.length === 0;
  const remaining = MIN_SEARCH_LENGTH - trimmed.length;
  const hint = !isAuthenticated
    ? trimmed.length >= MIN_SHELF_LENGTH && "Sign in to search MangaDex and add titles"
    : trimmed.length > 0 && remaining > 0
      ? `Type ${remaining} more character${remaining === 1 ? "" : "s"} to search MangaDex`
      : "";
  const showDropdown = open && (options.length > 0 || Boolean(error || noMatch || hint));
  const optionId = (index) => `${listboxId}-option-${index}`;

  const runSearch = async (text) => {
    const queryId = ++latestQueryId.current;
    const isLatest = () => queryId === latestQueryId.current;
    setLoading(true);
    try {
      const found = await searchMangaDex({ query: text });
      if (isLatest()) {
        setResults(found);
        setSearchedFor(text);
      }
    } catch (err) {
      console.error("MangaDex search failed:", err);
      if (isLatest()) setError("MangaDex search failed. Try again in a moment.");
    } finally {
      if (isLatest()) setLoading(false);
    }
  };

  const reset = () => {
    clearTimeout(debounceTimer.current);
    latestQueryId.current++; // ignore any in-flight search
    setResults([]);
    setLoading(false);
    setError("");
    setSearchedFor("");
    setActiveIndex(-1);
  };

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleChange = (text) => {
    setQuery(text);
    setOpen(true);
    reset();
    if (!isAuthenticated || text.trim().length < MIN_SEARCH_LENGTH) return;
    debounceTimer.current = setTimeout(() => runSearch(text.trim()), SEARCH_DEBOUNCE_MS);
  };

  const choose = (option) => {
    setQuery("");
    reset();
    close();
    if (option.title) onOpen(option.title._id);
    else onPick(option.result);
  };

  // Enter or the Search button: pick the highlighted result, or search MangaDex now instead of
  // waiting for the debounce.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (open && activeIndex >= 0 && options[activeIndex]) {
      choose(options[activeIndex]);
      return;
    }
    if (!isAuthenticated || trimmed.length < MIN_SEARCH_LENGTH) {
      inputRef.current?.focus();
      return;
    }
    setOpen(true);
    reset();
    runSearch(trimmed);
  };

  const moveActive = (step) => {
    if (options.length === 0) return;
    setOpen(true);
    const next = Math.min(Math.max(activeIndex + step, 0), options.length - 1);
    setActiveIndex(next);
    document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  };

  const renderOption = (option, index) => (
    <ListItemButton
      key={option.key}
      id={optionId(index)}
      component="div"
      role="option"
      aria-selected={index === activeIndex}
      tabIndex={-1}
      selected={index === activeIndex}
      onMouseDown={(e) => e.preventDefault()} // keep focus in the input
      onClick={() => choose(option)}
      onMouseMove={() => index !== activeIndex && setActiveIndex(index)}
      sx={{
        minHeight: 56,
        "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "var(--panel-raised)" },
      }}
    >
      {option.title ? (
        <>
          <ShelfThumb title={option.title} />
          <ListItemText
            primary={option.title.name}
            secondary={
              option.title.ratingCount > 0
                ? `On the list · ${option.title.ratingCount} ${
                    option.title.ratingCount === 1 ? "rating" : "ratings"
                  }`
                : "On the list · not rated yet"
            }
          />
        </>
      ) : (
        <ListItemText
          primary={option.result.name}
          secondary={option.result.tags.slice(0, 4).join(" · ") || "MangaDex"}
        />
      )}
    </ListItemButton>
  );

  return (
    <ClickAwayListener onClickAway={() => open && close()}>
      <Box
        component="form"
        role="search"
        onSubmit={handleSubmit}
        sx={{
          position: "relative",
          display: "flex",
          gap: 1.5,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <TextField
          fullWidth
          size="medium"
          placeholder="Search the list or MangaDex"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => trimmed && setOpen(true)}
          inputRef={inputRef}
          slotProps={{
            htmlInput: {
              role: "combobox",
              "aria-label": "Search the list or MangaDex",
              "aria-expanded": showDropdown,
              "aria-controls": listboxId,
              "aria-autocomplete": "list",
              "aria-activedescendant": activeIndex >= 0 ? optionId(activeIndex) : undefined,
              "aria-keyshortcuts": "/",
              autoComplete: "off",
            },
            input: {
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} aria-label="Searching MangaDex" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": { bgcolor: "var(--bg)", borderRadius: "10px" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SearchIcon />}
          sx={{
            flexShrink: 0,
            minHeight: 56,
            px: 3,
            borderRadius: "10px",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Search
        </Button>

        {showDropdown && (
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              top: 64, // just under the 56px field, over the button when it wraps on phones
              left: 0,
              right: 0,
              zIndex: "modal",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ m: 1 }}>
                {error}
              </Alert>
            )}
            {noMatch && !error && (
              <Alert severity="info" sx={{ m: 1 }}>
                Nothing on the list or MangaDex matches “{searchedFor}”.
              </Alert>
            )}

            <Box id={listboxId} role="listbox" aria-label="Search results">
              {shelf.length > 0 && (
                <Box role="group" aria-labelledby={`${listboxId}-shelf`}>
                  <Typography id={`${listboxId}-shelf`} role="presentation" sx={groupLabelSx}>
                    On the list
                  </Typography>
                  {shelf.map((title, i) => renderOption(options[i], i))}
                </Box>
              )}
              {fresh.length > 0 && (
                <Box role="group" aria-labelledby={`${listboxId}-md`}>
                  <Typography id={`${listboxId}-md`} role="presentation" sx={groupLabelSx}>
                    Add from MangaDex
                  </Typography>
                  {fresh.map((_, i) => renderOption(options[shelf.length + i], shelf.length + i))}
                </Box>
              )}
            </Box>

            {hint && (
              <Typography variant="body2" color="textSecondary" sx={{ px: 2, py: 1.5 }}>
                {hint}
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default TitleSearch;
