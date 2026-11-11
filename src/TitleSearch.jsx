import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../convex/_generated/api";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 400;

// Searches MangaDex as you type and calls onPick with the chosen result.
function TitleSearch({ onPick }) {
  const searchMangaDex = useAction(api.mangadex.search);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceTimer = useRef(null);
  const latestQueryId = useRef(0);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  const runSearch = async (text) => {
    const queryId = ++latestQueryId.current;
    const isLatest = () => queryId === latestQueryId.current;
    setLoading(true);
    try {
      const found = await searchMangaDex({ query: text });
      if (isLatest()) setResults(found);
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
  };

  const handleChange = (text) => {
    setQuery(text);
    reset();
    if (text.trim().length < MIN_SEARCH_LENGTH) return;
    debounceTimer.current = setTimeout(() => runSearch(text.trim()), SEARCH_DEBOUNCE_MS);
  };

  const pick = (result) => {
    setQuery("");
    reset();
    onPick(result);
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <TextField
        fullWidth
        size="medium"
        label="Search MangaDex to add a title"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: loading && <CircularProgress size={20} />,
          },
        }}
      />

      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      {results.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 1, maxHeight: 320, overflowY: "auto" }}>
          <List dense disablePadding>
            {results.map((result) => (
              <ListItemButton key={result.id} onClick={() => pick(result)} divider>
                <ListItemText primary={result.name} secondary={result.tags.slice(0, 4).join(" · ")} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default TitleSearch;
