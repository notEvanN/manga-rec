import { Box } from "@mui/material";

// Shown while a cover is still downloading, or when a title has none.
function CoverPlaceholder({ name, height = 220 }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <Box
      sx={{
        height,
        display: "grid",
        placeItems: "center",
        bgcolor: "action.hover",
        color: "text.secondary",
        typography: "h2",
      }}
    >
      {initials}
    </Box>
  );
}

export default CoverPlaceholder;
