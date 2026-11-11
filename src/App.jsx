import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { Box, Container, MenuItem, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { api } from "../convex/_generated/api";
import Header from "./components/Header";
import TitleSearch from "./components/TitleSearch";
import TitleCard from "./components/TitleCard";
import AddTitleDialog from "./components/AddTitleDialog";
import TitleDetailDialog from "./components/TitleDetailDialog";
import { STATUS_OPTIONS } from "./lib/constants";

const SORTERS = {
  newest: null, // server already returns newest first
  rating: (a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1),
  mostRated: (a, b) => b.ratingCount - a.ratingCount || (b.avgRating ?? -1) - (a.avgRating ?? -1),
};

const gridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))",
  gap: 2,
};

function App() {
  const { isSignedIn, user } = useUser();
  const me = useQuery(api.users.me);
  const users = useQuery(api.users.list);
  const allTitles = useQuery(api.titles.list);
  const ensureUser = useMutation(api.users.ensure);

  const currentUserId = me?._id ?? "";

  // Make sure a Convex user record exists for the signed-in Clerk user.
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
    const email = user.primaryEmailAddress?.emailAddress;
    ensureUser({ name: name || undefined, email }).catch((err) =>
      console.error("Failed to create user record:", err),
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
        myStatuses.filter((s) => s.status === activeStatusFilter).map((s) => s.titleId),
      );
      result = result.filter((t) => ids.has(t._id));
    }

    const sorter = SORTERS[sortMode];
    return sorter ? [...result].sort(sorter) : result;
  }, [allTitles, sortMode, activeStatusFilter, myStatuses]);

  // dialogs: store the id so the detail dialog always shows live data
  const [pendingTitle, setPendingTitle] = useState(null);
  const [selectedTitleId, setSelectedTitleId] = useState(null);
  const selectedTitle = allTitles?.find((t) => t._id === selectedTitleId);

  return (
    <>
      <Header userName={me?.name} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <TitleSearch onPick={setPendingTitle} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mt: 5, mb: 2 }}
        >
          <Typography variant="h2" component="h2">
            Titles
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              label="Sort by"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="rating">Highest rated</MenuItem>
              <MenuItem value="mostRated">Most rated</MenuItem>
            </TextField>

            <TextField
              select
              label="My status"
              value={activeStatusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={!currentUserId}
              helperText={currentUserId ? undefined : "Sign in to filter"}
              slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {titles === undefined ? (
          <Box sx={gridSx}>
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} variant="rounded" height={380} />
            ))}
          </Box>
        ) : titles.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>
            {activeStatusFilter
              ? "No titles with that status yet."
              : "No titles yet. Search MangaDex above to add the first one."}
          </Typography>
        ) : (
          <Box sx={gridSx}>
            {titles.map((title) => (
              <TitleCard key={title._id} title={title} onOpen={setSelectedTitleId} />
            ))}
          </Box>
        )}
      </Container>

      {pendingTitle && (
        <AddTitleDialog
          key={pendingTitle.id}
          title={pendingTitle}
          isSignedIn={Boolean(currentUserId)}
          onClose={() => setPendingTitle(null)}
        />
      )}

      {selectedTitle && (
        <TitleDetailDialog
          key={selectedTitle._id}
          title={selectedTitle}
          currentUserId={currentUserId}
          users={users}
          onClose={() => setSelectedTitleId(null)}
        />
      )}
    </>
  );
}

export default App;
