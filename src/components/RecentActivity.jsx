import { useState } from "react";
import { Box, Button, ButtonBase, Skeleton, Stack, Typography, useMediaQuery } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { panelSx } from "../theme/theme";
import { timeAgo, useNow } from "../lib/time";
import PersonAvatar from "./PersonAvatar";
import StatusChip from "./StatusChip";

const VERBS = { added: "added", rated: "rated", status: "marked" };

// Below lg the feed sits between the carousel and the grid, so keep it short there.
const COLLAPSED_COUNT = 5;

function ActivityItem({ item, now, onOpen }) {
  return (
    <Box component="li">
      <ButtonBase
        component="div"
        onClick={() => onOpen(item.titleId)}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          gap: 1.5,
          // Hover fill bleeds 8px past the text on each side, so text stays aligned with the heading.
          width: "calc(100% + 16px)",
          textAlign: "left",
          py: 2,
          px: 1,
          mx: -1,
          borderRadius: "10px",
          transition: "background-color 120ms ease-out",
          "&:hover": { bgcolor: "var(--panel-raised)" },
          "&.Mui-focusVisible": { outline: "2px solid var(--accent)", outlineOffset: 0 },
        }}
      >
        <PersonAvatar name={item.userName} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <Box component="span" sx={{ fontWeight: 600 }}>
              {item.userName}
            </Box>{" "}
            <Box component="span" sx={{ color: "text.secondary" }}>
              {VERBS[item.kind]}
            </Box>{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {item.titleName}
            </Box>
          </Typography>

          <Stack
            direction="row"
            useFlexGap
            spacing={1}
            sx={{ alignItems: "center", flexWrap: "wrap", mt: 0.75 }}
          >
            {item.score != null && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <StarIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.score}
                  <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {" "}
                    /10
                  </Box>
                </Typography>
              </Stack>
            )}
            {item.status && <StatusChip status={item.status} />}
            <Typography
              variant="body2"
              color="textSecondary"
              component="time"
              dateTime={new Date(item.at).toISOString()}
            >
              {timeAgo(item.at, now)}
            </Typography>
          </Stack>
        </Box>
      </ButtonBase>
    </Box>
  );
}

// Who added, rated or tracked what, newest first. Each row opens its title.
// `items`: [{ _id, userName, kind: "added" | "rated" | "status", titleId, titleName, score?, status?, at }]
function RecentActivity({ items, onOpen }) {
  const now = useNow();
  const isCompact = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [expanded, setExpanded] = useState(false);

  const collapsible = isCompact && items?.length > COLLAPSED_COUNT;
  const shown = collapsible && !expanded ? items.slice(0, COLLAPSED_COUNT) : items;

  return (
    <Box
      component="section"
      aria-labelledby="activity-heading"
      // Secondary to the hero and carousel: outline only, no fill.
      sx={{ ...panelSx, bgcolor: "transparent", p: { xs: 2, md: 3 }, pb: { xs: 1, md: 1.5 } }}
    >
      <Typography id="activity-heading" variant="h3" component="h2" sx={{ mb: 1 }}>
        Recent activity
      </Typography>

      {items === undefined ? (
        <Stack spacing={2} sx={{ py: 2 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <Typography color="textSecondary" sx={{ py: 3 }}>
          No activity yet. Add or rate a title and it will show up here.
        </Typography>
      ) : (
        <>
          <Box
            component="ol"
            sx={{
              listStyle: "none",
              m: 0,
              p: 0,
              "& > li + li": { borderTop: "1px solid var(--border)" },
            }}
          >
            {shown.map((item) => (
              <ActivityItem key={item._id} item={item} now={now} onOpen={onOpen} />
            ))}
          </Box>

          {collapsible && (
            <Button
              fullWidth
              color="inherit"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              sx={{ mt: 0.5, mb: 1, color: "text.secondary", fontWeight: 500 }}
            >
              {expanded ? "Show less" : `Show ${items.length - COLLAPSED_COUNT} more`}
            </Button>
          )}
        </>
      )}
    </Box>
  );
}

export default RecentActivity;
