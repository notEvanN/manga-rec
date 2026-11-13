import { Box, Skeleton, Stack, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { panelSx } from "../theme/theme";
import { STATUS_LABELS } from "../lib/constants";
import { timeAgo, useNow } from "../lib/time";

const VERBS = { added: "added", rated: "rated", status: "updated" };

const AVATAR_COLORS = ["var(--avatar-1)", "var(--avatar-2)", "var(--avatar-3)", "var(--avatar-4)"];

const STATUS_COLORS = {
  reading: ["var(--status-reading)", "var(--status-reading-bg)"],
  completed: ["var(--status-completed)", "var(--status-completed-bg)"],
  dropped: ["var(--status-dropped)", "var(--status-dropped-bg)"],
  plan_to_read: ["var(--status-plan)", "var(--status-plan-bg)"],
};

// Stable colour per person.
function avatarColor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: avatarColor(name),
        color: "var(--on-avatar)",
        fontWeight: 700,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Box>
  );
}

function StatusChip({ status }) {
  const [color, bg] = STATUS_COLORS[status];
  return (
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: "6px",
        fontSize: "0.875rem",
        fontWeight: 600,
        color,
        bgcolor: bg,
      }}
    >
      {STATUS_LABELS[status]}
    </Box>
  );
}

function ActivityItem({ item, now }) {
  return (
    <Stack component="li" direction="row" spacing={1.5} sx={{ py: 2 }}>
      <Avatar name={item.userName} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ lineHeight: 1.4 }}>
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
          <Typography variant="body2" color="textSecondary" component="time">
            {timeAgo(item.at, now)}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

// Who added or rated what, newest first.
// `items`: [{ _id, userName, kind: "added" | "rated" | "status", titleName, score?, status?, at }]
function RecentActivity({ items }) {
  const now = useNow();

  return (
    <Box
      component="section"
      aria-labelledby="activity-heading"
      sx={{ ...panelSx, p: { xs: 2, md: 3 }, pb: { xs: 1, md: 1.5 } }}
    >
      <Typography id="activity-heading" variant="h2" sx={{ mb: 1 }}>
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
        <Box
          component="ol"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            "& > li + li": { borderTop: "1px solid var(--border)" },
          }}
        >
          {items.map((item) => (
            <ActivityItem key={item._id} item={item} now={now} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default RecentActivity;
