import { Box, Button, Stack, Typography } from "@mui/material";
import { useClerk, useUser } from "@clerk/clerk-react";
import { panelSx } from "../theme/theme";
import TitleSearch from "./TitleSearch";

// Banner at the top of the home page: a prompt plus the list/MangaDex search.
// Guests get a one-line explanation of MangaRec and a way in, since they can browse but not rate.
function Hero({ titles, onOpen, onPick }) {
  const { isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
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

        {isGuest && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => clerk.openSignIn()}>
              Sign in to rate
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => clerk.openSignUp()}
              sx={{ borderColor: "divider" }}
            >
              Create account
            </Button>
          </Stack>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TitleSearch titles={titles} onOpen={onOpen} onPick={onPick} />
      </Box>
    </Box>
  );
}

export default Hero;
