import { Box } from "@mui/material";

const AVATAR_COLORS = ["var(--avatar-1)", "var(--avatar-2)", "var(--avatar-3)", "var(--avatar-4)"];

// Stable colour per person, so someone keeps the same colour everywhere.
function avatarColor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Round initial in the person's colour. Decorative: the name is always written next to it.
function PersonAvatar({ name, size = 40 }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: avatarColor(name),
        color: "var(--on-avatar)",
        fontWeight: 700,
        fontSize: size < 40 ? "0.875rem" : "1rem",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Box>
  );
}

export default PersonAvatar;
