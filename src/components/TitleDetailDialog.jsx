import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Rating,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import FlagIcon from "@mui/icons-material/Flag";
import { api } from "../../convex/_generated/api";
import { STATUS_OPTIONS, STATUS_LABELS } from "../lib/constants";
import CoverPlaceholder from "./CoverPlaceholder";

function TitleDetailDialog({ title, currentUserId, users, onClose }) {
  const ratings = useQuery(api.ratings.forTitle, { titleId: title._id });
  const statuses = useQuery(api.readStatus.forTitle, { titleId: title._id });

  const rate = useMutation(api.ratings.rate);
  const setStatus = useMutation(api.readStatus.setStatus);
  const getLatestChapter = useAction(api.mangadex.latestChapter);

  const [actionError, setActionError] = useState("");
  const [latestChapter, setLatestChapter] = useState(undefined);

  const isSignedIn = Boolean(currentUserId);
  const myRating = ratings?.find((r) => r.userId === currentUserId);
  const myStatus = statuses?.find((s) => s.userId === currentUserId);

  useEffect(() => {
    if (!title.mangaDexId) return;
    let cancelled = false;
    getLatestChapter({ mangaDexId: title.mangaDexId })
      .then((ch) => !cancelled && setLatestChapter(ch))
      .catch(() => !cancelled && setLatestChapter(null));
    return () => {
      cancelled = true;
    };
  }, [title.mangaDexId, getLatestChapter]);

  const getUserName = (userId) => users?.find((u) => u._id === userId)?.name ?? "Unknown";

  const runAction = async (fn) => {
    setActionError("");
    try {
      await fn();
    } catch (err) {
      setActionError(err.message);
    }
  };

  // One row per person who rated or tracked this title.
  const friendIds = [...new Set([...(ratings ?? []), ...(statuses ?? [])].map((x) => x.userId))];

  return (
    <Dialog open onClose={onClose} scroll="body">
      <DialogTitle sx={{ pr: 6 }}>
        {title.name}
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ width: { xs: "100%", sm: 160 }, flexShrink: 0, borderRadius: 1, overflow: "hidden" }}>
            {title.coverUrl ? (
              <Box
                component="img"
                src={title.coverUrl}
                alt={title.name}
                sx={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }}
              />
            ) : (
              <CoverPlaceholder name={title.name} height={220} />
            )}
          </Box>

          <Stack spacing={1}>
            {title.avgRating != null && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <StarIcon color="secondary" />
                <Typography sx={{ fontWeight: 700 }}>{title.avgRating.toFixed(1)}/10</Typography>
                <Typography color="text.secondary">
                  ({title.ratingCount} rating{title.ratingCount !== 1 ? "s" : ""})
                </Typography>
              </Stack>
            )}

            {title.mangaDexId && (
              <Typography variant="body2" color="text.secondary">
                {latestChapter === undefined
                  ? "Loading latest chapter..."
                  : latestChapter
                    ? `Latest (EN): Chapter ${latestChapter}`
                    : "No English chapters found"}
              </Typography>
            )}

            {title.addedBy && (
              <Typography variant="body2" color="text.secondary">
                Added by {getUserName(title.addedBy)}
              </Typography>
            )}

            <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexWrap: "wrap" }}>
              {title.slop && <Chip icon={<FlagIcon />} label="Slop" color="error" />}
              {title.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </Stack>

        {title.description && (
          <Typography variant="body2" sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {title.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Your rating</Typography>
            <Rating
              max={10}
              value={myRating?.score ?? null}
              onChange={(_, score) => score && runAction(() => rate({ titleId: title._id, score }))}
              disabled={!isSignedIn}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Your status</Typography>
            <ToggleButtonGroup
              exclusive
              color="primary"
              value={myStatus?.status ?? null}
              onChange={(_, status) => status && runAction(() => setStatus({ titleId: title._id, status }))}
              disabled={!isSignedIn}
              sx={{ flexWrap: "wrap" }}
            >
              {STATUS_OPTIONS.map(({ value, label }) => (
                <ToggleButton key={value} value={value}>{label}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {!isSignedIn && <Alert severity="info">Sign in to rate or track this title.</Alert>}
          {actionError && <Alert severity="error">{actionError}</Alert>}
        </Stack>

        {friendIds.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2">Everyone</Typography>
            <List dense disablePadding>
              {friendIds.map((userId) => {
                const score = ratings?.find((r) => r.userId === userId)?.score;
                const status = statuses?.find((s) => s.userId === userId)?.status;
                return (
                  <ListItem key={userId} disableGutters>
                    <ListItemText primary={getUserName(userId)} />
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      {status && <Chip label={STATUS_LABELS[status] ?? status} variant="outlined" />}
                      {score != null && <Typography sx={{ fontWeight: 700 }}>{score}/10</Typography>}
                    </Stack>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TitleDetailDialog;
