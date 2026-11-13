import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";

// Home and All titles live on this page. My list and Friends don't have pages yet.
const NAV_ITEMS = [
  { label: "Home", href: "#top", icon: HomeOutlinedIcon, current: true },
  { label: "All titles", href: "#all-titles", icon: GridViewOutlinedIcon },
  { label: "My list", icon: BookmarkBorderIcon, comingSoon: true },
  { label: "Friends", icon: PeopleOutlinedIcon, comingSoon: true },
];

const navItemSx = {
  justifyContent: "flex-start",
  gap: 1.5,
  px: 2,
  py: 1.25,
  borderRadius: "10px",
  fontWeight: 500,
  fontSize: "1rem",
  whiteSpace: "nowrap",
  color: "text.primary",
  "& .MuiSvgIcon-root": { fontSize: 22 },
  "&:hover": { bgcolor: "var(--panel-raised)" },
  "&[aria-current='page']": { bgcolor: "var(--panel-raised)", color: "primary.main" },
  "&.Mui-disabled": { color: "text.secondary", opacity: 0.6 },
};

function Logo() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: { md: 1 } }}>
      <Box
        aria-hidden
        sx={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
          fontSize: "1.25rem",
        }}
      >
        M
      </Box>
      <Typography sx={{ typography: "h3", fontSize: "1.375rem" }}>MangaRec</Typography>
    </Stack>
  );
}

function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";
  const label = isDark ? "Light mode" : "Dark mode";
  const icon = isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />;
  const toggle = () => setMode(isDark ? "light" : "dark");

  return (
    <>
      {/* icon-only in the mobile top bar */}
      <IconButton
        onClick={toggle}
        aria-label={label}
        title={label}
        sx={{ display: { md: "none" }, border: 1, borderColor: "divider" }}
      >
        {icon}
      </IconButton>
      <Button
        variant="outlined"
        color="inherit"
        onClick={toggle}
        startIcon={icon}
        sx={{
          display: { xs: "none", md: "inline-flex" },
          borderColor: "divider",
          fontWeight: 500,
          py: 1,
        }}
      >
        {label}
      </Button>
    </>
  );
}

function Account({ userName }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;

  if (!isSignedIn) {
    // On phones Clerk's sign-in modal links to sign-up, so only Sign in is shown there.
    return (
      <Stack direction={{ xs: "row", md: "column" }} spacing={1}>
        <SignInButton mode="modal">
          <Button variant="contained">Sign in</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button
            variant="outlined"
            color="inherit"
            sx={{ display: { xs: "none", sm: "inline-flex" }, borderColor: "divider" }}
          >
            Create account
          </Button>
        </SignUpButton>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
      <UserButton appearance={{ elements: { avatarBox: { width: 40, height: 40 } } }} />
      <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
        <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
          {userName ?? "…"}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Signed in
        </Typography>
      </Box>
    </Stack>
  );
}

// Left column on desktop. On small screens: logo and account on top, nav scrolling underneath.
function Sidebar({ userName }) {
  return (
    <Box
      component="aside"
      sx={{
        flexShrink: 0,
        width: { md: 280 },
        height: { md: "100vh" },
        position: { md: "sticky" },
        top: 0,
        display: "grid",
        gridTemplateColumns: { xs: "1fr auto", md: "1fr" },
        gridTemplateRows: { md: "auto auto 1fr" },
        gridTemplateAreas: { xs: `"logo account" "nav nav"`, md: `"logo" "nav" "account"` },
        alignItems: "center",
        gap: { xs: 1.5, md: 3 },
        p: { xs: 2, md: 2.5 },
        pt: { md: 4 },
        bgcolor: "var(--bg)",
        borderRight: { md: "1px solid var(--border)" },
        borderBottom: { xs: "1px solid var(--border)", md: "none" },
      }}
    >
      <Box sx={{ gridArea: "logo" }}>
        <Logo />
      </Box>

      <Box
        component="nav"
        aria-label="Main"
        sx={{
          gridArea: "nav",
          alignSelf: "start",
          display: "flex",
          flexDirection: { xs: "row", md: "column" },
          gap: 0.5,
          overflowX: { xs: "auto", md: "visible" },
          "& > *": { flexShrink: 0 },
        }}
      >
        {NAV_ITEMS.map(({ label, href, icon: Icon, current, comingSoon }) => (
          <Button
            key={label}
            href={href}
            disabled={comingSoon}
            aria-current={current ? "page" : undefined}
            title={comingSoon ? "Coming soon" : undefined}
            startIcon={<Icon />}
            sx={navItemSx}
          >
            {label}
          </Button>
        ))}
      </Box>

      <Box
        sx={{
          gridArea: "account",
          alignSelf: { md: "end" },
          display: "flex",
          flexDirection: { xs: "row", md: "column" },
          alignItems: { xs: "center", md: "stretch" },
          gap: { xs: 1, md: 2 },
          // bordered card at the bottom of the sidebar; plain row in the mobile top bar
          p: { md: 2 },
          border: { md: "1px solid var(--border)" },
          borderRadius: "14px",
          bgcolor: { md: "background.paper" },
        }}
      >
        <Account userName={userName} />
        <ThemeToggle />
      </Box>
    </Box>
  );
}

export default Sidebar;
