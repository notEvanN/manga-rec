import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { Box } from "@mui/material";
import { api } from "../convex/_generated/api";
import Sidebar from "./components/Sidebar";
import Hero from "./components/Hero";
import MostRated from "./components/MostRated";
import AllTitles from "./components/AllTitles";
import RecentActivity from "./components/RecentActivity";
import AddTitleDialog from "./components/AddTitleDialog";
import TitleDetailDialog from "./components/TitleDetailDialog";

// Hero across the top; carousel and titles on the left, activity on the right.
// On narrow screens everything stacks, with activity between the carousel and the titles.
const pageGridSx = {
  maxWidth: 1480,
  mx: "auto",
  display: "grid",
  gap: { xs: 3, md: 4 },
  gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 360px" },
  gridTemplateRows: { lg: "auto auto 1fr" },
  gridTemplateAreas: {
    xs: `"hero" "rated" "activity" "titles"`,
    lg: `"hero hero" "rated activity" "titles activity"`,
  },
};

function App() {
  const { isSignedIn, user } = useUser();
  const me = useQuery(api.users.me);
  const users = useQuery(api.users.list);
  const allTitles = useQuery(api.titles.list);
  const activity = useQuery(api.activity.recent);
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

  // dialogs: store the id so the detail dialog always shows live data
  const [pendingTitle, setPendingTitle] = useState(null);
  const [selectedTitleId, setSelectedTitleId] = useState(null);
  const selectedTitle = allTitles?.find((t) => t._id === selectedTitleId);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
        <Sidebar userName={me?.name} />

        <Box component="main" id="top" sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={pageGridSx}>
            <Box sx={{ gridArea: "hero" }}>
              <Hero onPick={setPendingTitle} />
            </Box>

            <Box sx={{ gridArea: "rated", minWidth: 0 }}>
              <MostRated titles={allTitles} onOpen={setSelectedTitleId} />
            </Box>

            <Box sx={{ gridArea: "activity", minWidth: 0, alignSelf: "start" }}>
              <RecentActivity items={activity} />
            </Box>

            <Box sx={{ gridArea: "titles", minWidth: 0 }}>
              <AllTitles
                titles={allTitles}
                signedIn={Boolean(currentUserId)}
                onOpen={setSelectedTitleId}
              />
            </Box>
          </Box>
        </Box>
      </Box>

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
