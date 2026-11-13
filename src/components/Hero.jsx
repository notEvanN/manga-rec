import { Box, Typography } from "@mui/material";
import { panelSx } from "../theme/theme";
import TitleSearch from "./TitleSearch";

// Banner at the top of the home page: a prompt plus the MangaDex search.
function Hero({ onPick }) {
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
      <Box sx={{ flexShrink: 0 }}>
        <Typography id="hero-heading" variant="h1">
          Found something worth reading?
        </Typography>
        <Typography color="textSecondary" sx={{ mt: 0.5, fontSize: "1.0625rem" }}>
          Search MangaDex, then rate it.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TitleSearch onPick={onPick} />
      </Box>
    </Box>
  );
}

export default Hero;
