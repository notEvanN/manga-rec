import { AppBar, Toolbar, Typography, IconButton, Button, Stack, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";

function Header({ userName }) {
  const { isLoaded, isSignedIn } = useUser();
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";

  return (
    <AppBar>
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h1" sx={{ flexGrow: 1 }}>
          Manga Tracker
        </Typography>

        <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
          <IconButton
            onClick={() => setMode(isDark ? "light" : "dark")}
            aria-label="Toggle dark mode"
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {isLoaded &&
          (isSignedIn ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                {userName ?? "…"}
              </Typography>
              <UserButton />
            </Stack>
          ) : (
            <SignInButton mode="modal">
              <Button variant="contained">Sign in</Button>
            </SignInButton>
          ))}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
