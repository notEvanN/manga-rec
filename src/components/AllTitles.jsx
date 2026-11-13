import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  Box,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { api } from "../../convex/_generated/api";
import { STATUS_LABELS, STATUS_OPTIONS } from "../lib/constants";
import { SORTERS } from "../lib/sorters";
import TitleCard from "./TitleCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "mostRated", label: "Most rated" },
];

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(auto-fill, minmax(140px, 1fr))",
    sm: "repeat(auto-fill, minmax(200px, 1fr))",
  },
  columnGap: 3,
  rowGap: 4,
};

const pillSx = {
  borderRadius: "999px",
  border: "1px solid var(--border)",
  color: "text.primary",
  fontSize: "0.9375rem",
  fontWeight: 500,
};

const toggleGroupSx = {
  gap: 1,
  flexWrap: "wrap",
  "& .MuiToggleButton-root": {
    ...pillSx,
    px: 2,
    py: 0.75,
    // ToggleButtonGroup squares off and merges neighbouring borders; undo that for pills
    "&.MuiToggleButtonGroup-grouped": {
      borderRadius: "999px",
      border: "1px solid var(--border)",
      m: 0,
    },
    "&.Mui-selected, &.Mui-selected:hover": {
      bgcolor: "var(--accent-soft)",
      color: "primary.main",
      borderColor: "primary.main",
    },
  },
};

// The full grid of titles, with sort pills and a "my status" filter.
function AllTitles({ titles, signedIn, onOpen }) {
  const [sortMode, setSortMode] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("");
  const activeStatusFilter = signedIn ? statusFilter : "";
  const myStatuses = useQuery(api.readStatus.mine, activeStatusFilter ? {} : "skip");

  const shown = useMemo(() => {
    if (!titles) return undefined;

    let result = titles;
    if (activeStatusFilter && myStatuses) {
      const ids = new Set(
        myStatuses.filter((s) => s.status === activeStatusFilter).map((s) => s.titleId),
      );
      result = result.filter((t) => ids.has(t._id));
    }

    const sorter = SORTERS[sortMode];
    return sorter ? [...result].sort(sorter) : result;
  }, [titles, sortMode, activeStatusFilter, myStatuses]);

  return (
    <Box component="section" id="all-titles" aria-labelledby="all-titles-heading">
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { md: "center" }, mb: 3 }}
      >
        <Typography id="all-titles-heading" variant="h2">
          All titles
        </Typography>

        <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: "wrap" }}>
          <ToggleButtonGroup
            exclusive
            aria-label="Sort titles"
            value={sortMode}
            onChange={(_, value) => value && setSortMode(value)}
            sx={toggleGroupSx}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Select
            size="small"
            displayEmpty
            value={activeStatusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={!signedIn}
            title={signedIn ? undefined : "Sign in to filter by your status"}
            renderValue={(value) => `My status: ${value ? STATUS_LABELS[value] : "All"}`}
            inputProps={{ "aria-label": "Filter by my status" }}
            sx={{
              ...pillSx,
              "& .MuiOutlinedInput-notchedOutline": { border: 0 },
              "& .MuiSelect-select": { py: 0.75, pl: 2 },
            }}
          >
            <MenuItem value="">All</MenuItem>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      {shown === undefined ? (
        <Box sx={gridSx}>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} variant="rounded" sx={{ height: "auto", aspectRatio: "2 / 3" }} />
          ))}
        </Box>
      ) : shown.length === 0 ? (
        <Typography color="textSecondary" sx={{ textAlign: "center", py: 8 }}>
          {activeStatusFilter
            ? "No titles with that status yet."
            : "No titles yet. Search MangaDex above to add the first one."}
        </Typography>
      ) : (
        <Box sx={gridSx}>
          {shown.map((title) => (
            <TitleCard key={title._id} title={title} onOpen={onOpen} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default AllTitles;
