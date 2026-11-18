import { Box, Typography } from "@mui/material";
import { useUser } from "@clerk/clerk-react";
import { panelSx } from "../theme/theme";
import TitleSearch from "./TitleSearch";

// Banner at the top of the home page: a prompt plus the list/MangaDex search.
// Guests get a one-line explanation of MangaRec; signing in lives in the sidebar.
function Hero({ titles, onOpen, onPick }) {
  const { isLoaded, isSignedIn } = useUser();
  const isGuest = isLoaded && !isSignedIn;

  return (
    <Box
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        ...panelSx,
        p: { xs: 2.5, md: 4 },
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: { lg: "center" },
        gap: { xs: 2.5, lg: 4 },
      }}
    >
      <Box sx={{ flexShrink: 0, maxWidth: { lg: 420 } }}>
        <Typography id="hero-heading" variant="h1" sx={{ textWrap: "balance" }}>
          {isGuest ? "Your group's manga list" : "Found something worth reading?"}
        </Typography>
        {isGuest && (
          <Typography color="textSecondary" sx={{ mt: 0.5, fontSize: "1.0625rem" }}>
            See what your friends are reading and how each of them rated it.
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TitleSearch titles={titles} onOpen={onOpen} onPick={onPick} />
      </Box>
    </Box>
  );
}

export default Hero;
