import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../../convex/_generated/api";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 400;

// Searches MangaDex as you type (or right away on Enter / "Add manga") and calls onPick with the
// chosen result.
function TitleSearch({ onPick }) {
  const searchMangaDex = useAction(api.mangadex.search);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noMatchFor, setNoMatchFor] = useState("");
  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const runSearch = async (text) => {
    const queryId = ++latestQueryId.current;
    const isLatest = () => queryId === latestQueryId.current;
    setLoading(true);
    try {
      const found = await searchMangaDex({ query: text });
      if (isLatest()) {
        setResults(found);
        if (found.length === 0) setNoMatchFor(text);
      }
    } catch (err) {
      console.error("MangaDex search failed:", err);
      if (isLatest()) setError("Search failed. Please try again.");
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
    setNoMatchFor("");
  };

  const handleChange = (text) => {
    setQuery(text);
    reset();
    if (text.trim().length < MIN_SEARCH_LENGTH) return;
    debounceTimer.current = setTimeout(() => runSearch(text.trim()), SEARCH_DEBOUNCE_MS);
  };

  // Enter or "Add manga": search now instead of waiting for the debounce.
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = query.trim();
    if (text.length < MIN_SEARCH_LENGTH) {
      inputRef.current?.focus();
      return;
    }
    reset();
    runSearch(text);
  };

  const pick = (result) => {
    setQuery("");
    reset();
    onPick(result);
  };

  const showDropdown = results.length > 0 || Boolean(error || noMatchFor);

  return (
    <ClickAwayListener onClickAway={() => showDropdown && reset()}>
      <Box
        component="form"
        role="search"
        onSubmit={handleSubmit}
        onKeyDown={(e) => e.key === "Escape" && reset()}
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
          placeholder="Search MangaDex by title"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          inputRef={inputRef}
          slotProps={{
            htmlInput: { "aria-label": "Search MangaDex by title" },
            input: {
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
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
          startIcon={<AddIcon />}
          sx={{ flexShrink: 0, px: 3, borderRadius: "10px", width: { xs: "100%", sm: "auto" } }}
        >
          Add manga
        </Button>

        {showDropdown && (
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              zIndex: "modal",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {error || noMatchFor ? (
              <Alert severity={error ? "error" : "info"} sx={{ m: 1 }}>
                {error || `No MangaDex titles match "${noMatchFor}".`}
              </Alert>
            ) : (
              <List dense disablePadding>
                {results.map((result) => (
                  <ListItemButton key={result.id} onClick={() => pick(result)} divider>
                    <ListItemText
                      primary={result.name}
                      secondary={result.tags.slice(0, 4).join(" · ")}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default TitleSearch;
