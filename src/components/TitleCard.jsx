import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import FlagIcon from "@mui/icons-material/Flag";
import { hoverLift } from "../theme/theme";
import CoverPlaceholder from "./CoverPlaceholder";

const COVER_HEIGHT = 220;

function TitleCard({ title, onOpen }) {
  return (
    <Card sx={{ height: "100%", ...hoverLift }}>
      {/* component="div" keeps the HTML valid (block content isn't allowed inside <button>);
          MUI still gives it role="button", keyboard focus and Enter/Space handling. */}
      <CardActionArea component="div" onClick={() => onOpen(title._id)} sx={{ height: "100%" }}>
        {title.coverUrl ? (
          <CardMedia component="img" image={title.coverUrl} alt={title.name} sx={{ height: COVER_HEIGHT }} />
        ) : (
          <CoverPlaceholder name={title.name} height={COVER_HEIGHT} />
        )}

        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }} gutterBottom>
            {title.name}
          </Typography>

          {title.avgRating != null && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mb: 1 }}>
              <StarIcon color="secondary" fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {title.avgRating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({title.ratingCount})
              </Typography>
            </Stack>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {title.description}
          </Typography>

          <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexWrap: "wrap", mt: 1.5 }}>
            {title.slop && <Chip icon={<FlagIcon />} label="Slop" color="error" />}
            {title.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} variant="outlined" />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default TitleCard;
