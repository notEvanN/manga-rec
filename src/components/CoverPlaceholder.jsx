import { Box } from "@mui/material";

const TINTS = ["var(--tint-1)", "var(--tint-2)", "var(--tint-3)", "var(--tint-4)"];

// Stable colour per title, so a placeholder doesn't change colour between renders.
function tintFor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

// Shown while a cover is still downloading, or when a title has none. Fills its parent.
// aria-hidden: the title's name is always written next to the cover, so this would repeat it.
// `showName={false}` for thumbnails too small for readable text: just the tint.
function CoverPlaceholder({ name, showName = true }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        p: 1.75,
        bgcolor: tintFor(name),
        color: "var(--on-tint)",
        fontFamily: "h3.fontFamily",
        fontWeight: 700,
        fontSize: "1.0625rem",
        lineHeight: 1.25,
        overflowWrap: "anywhere",
      }}
    >
      {showName && name}
    </Box>
  );
}

export default CoverPlaceholder;
