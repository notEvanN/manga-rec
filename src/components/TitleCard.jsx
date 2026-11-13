import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { hoverLift } from "../theme/theme";
import CoverPlaceholder from "./CoverPlaceholder";

const badgeSx = {
  position: "absolute",
  top: 10,
  px: 0.875,
  py: 0.25,
  borderRadius: "6px",
  fontSize: "0.8125rem",
  fontWeight: 700,
  lineHeight: 1.6,
};

function Cover({ title, rank }) {
  return (
    <Box
      sx={{
        position: "relative",
        aspectRatio: "2 / 3",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      {/* placeholder sits underneath, so it shows until the cover has loaded */}
      <CoverPlaceholder name={title.name} />
      {title.coverUrl && (
        <Box
          component="img"
          src={title.coverUrl}
          alt=""
          loading="lazy"
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {rank != null && (
        <Box sx={{ ...badgeSx, left: 10, bgcolor: "rgb(0 0 0 / 0.72)", color: "#fff" }}>
          #{rank}
        </Box>
      )}
      {title.slop && (
        <Box sx={{ ...badgeSx, right: 10, bgcolor: "error.main", color: "error.contrastText" }}>
          Slop
        </Box>
      )}
    </Box>
  );
}

export function RatingLine({ avgRating, ratingCount }) {
  if (avgRating == null) {
    return (
      <Typography variant="body2" color="textSecondary">
        No ratings yet
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      <StarIcon sx={{ fontSize: 18, color: "primary.main" }} />
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {avgRating.toFixed(1)}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        · {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
      </Typography>
    </Stack>
  );
}

// Cover with name, rating and genres underneath. Pass `rank` to show a "#1"-style badge.
function TitleCard({ title, onOpen, rank }) {
  const genres = title.tags.slice(0, 2).join(", ");

  return (
    // component="div" keeps the HTML valid (block content isn't allowed inside <button>);
    // ButtonBase still gives it role="button", keyboard focus and Enter/Space handling.
    <ButtonBase
      component="div"
      onClick={() => onOpen(title._id)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        textAlign: "left",
        borderRadius: "12px",
        ...hoverLift,
        "&.Mui-focusVisible": { outline: "2px solid var(--accent)", outlineOffset: 3 },
      }}
    >
      <Cover title={title} rank={rank} />

      <Box sx={{ pt: 1.25, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.0625rem", mb: 0.5 }} noWrap>
          {title.name}
        </Typography>
        <RatingLine avgRating={title.avgRating} ratingCount={title.ratingCount} />
        {genres && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }} noWrap>
            {genres}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
}

export default TitleCard;
