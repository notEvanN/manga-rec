import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useClerk } from "@clerk/clerk-react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import FlagIcon from "@mui/icons-material/Flag";
import { api } from "../../convex/_generated/api";
import { slopExplainer, STATUS_LABELS } from "../lib/constants";
import { friendlyError } from "../lib/errors";
import { useToast } from "../lib/toast";
import CoverPlaceholder from "./CoverPlaceholder";
import PersonAvatar from "./PersonAvatar";
import ScorePicker from "./ScorePicker";
import StatusChip from "./StatusChip";
import StatusPicker from "./StatusPicker";

const LONG_DESCRIPTION = 280;

const sectionHeadingSx = { mb: 1 };

// What the group thinks: one row per person who rated or tracked this title, highest score first.
function GroupList({ ratings, statuses, users, currentUserId }) {
  const nameOf = (userId) => users?.find((u) => u._id === userId)?.name ?? "Someone";
  const ids = [...new Set([...ratings, ...statuses].map((x) => x.userId))];
  const rows = ids
    .map((userId) => ({
      userId,
      name: nameOf(userId),
      score: ratings.find((r) => r.userId === userId)?.score,
      status: statuses.find((s) => s.userId === userId)?.status,
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        Nobody has rated or tracked this yet.
      </Typography>
    );
  }

  return (
    <Box
      component="ul"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        "& > li + li": { borderTop: "1px solid var(--border)" },
      }}
    >
      {rows.map(({ userId, name, score, status }) => (
        <Stack
          component="li"
          key={userId}
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", py: 1.25 }}
        >
          <PersonAvatar name={name} size={32} />
          <Typography sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
            {name}
            {userId === currentUserId && (
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}>
                {" "}
                (you)
              </Box>
            )}
          </Typography>
          {status && <StatusChip status={status} />}
          <Typography
            sx={{
              fontWeight: 700,
              minWidth: 44,
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score != null ? (
              <>
                {score}
                <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  /10
                </Box>
              </>
            ) : (
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                –
              </Box>
            )}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}

function TitleDetailDialog({ title, currentUserId, users, onClose }) {
  const ratings = useQuery(api.ratings.forTitle, { titleId: title._id });
  const statuses = useQuery(api.readStatus.forTitle, { titleId: title._id });

  const rate = useMutation(api.ratings.rate);
  const clearRating = useMutation(api.ratings.clear);
  const setStatus = useMutation(api.readStatus.setStatus);
  const clearStatus = useMutation(api.readStatus.clear);
  const getLatestChapter = useAction(api.mangadex.latestChapter);

  const notify = useToast();
  const clerk = useClerk();
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [actionError, setActionError] = useState("");
  const [latestChapter, setLatestChapter] = useState(undefined);
  const [showFullDescription, setShowFullDescription] = useState(false);
  // Show a tap immediately; the live query catches up by the time the mutation resolves.
  const [pendingScore, setPendingScore] = useState(undefined);
  const [pendingStatus, setPendingStatus] = useState(undefined);

  const isSignedIn = Boolean(currentUserId);
  const myScore = ratings?.find((r) => r.userId === currentUserId)?.score ?? null;
  const myStatus = statuses?.find((s) => s.userId === currentUserId)?.status ?? null;

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

  const addedBy = title.addedBy && users?.find((u) => u._id === title.addedBy)?.name;

  const runAction = async (fn, successMessage, settle) => {
    setActionError("");
    try {
      await fn();
      notify(successMessage);
    } catch (err) {
      setActionError(friendlyError(err));
    } finally {
      settle();
    }
  };

  const onScoreChange = (score) => {
    setPendingScore(score);
    runAction(
      () =>
        score == null ? clearRating({ titleId: title._id }) : rate({ titleId: title._id, score }),
      score == null ? "Rating cleared" : `Saved · ${score}/10`,
      () => setPendingScore(undefined),
    );
  };

  const onStatusChange = (status) => {
    setPendingStatus(status);
    runAction(
      () =>
        status == null
          ? clearStatus({ titleId: title._id })
          : setStatus({ titleId: title._id, status }),
      status == null ? "Status cleared" : `Marked as ${STATUS_LABELS[status]}`,
      () => setPendingStatus(undefined),
    );
  };

  const signIn = () => {
    onClose();
    clerk.openSignIn();
  };

  const description = title.description?.trim();
  const isLongDescription = description && description.length > LONG_DESCRIPTION;

  return (
    <Dialog open onClose={onClose} scroll="paper" fullScreen={fullScreen}>
      <DialogTitle sx={{ pr: 7, lineHeight: 1.3 }}>
        <Box
          component="span"
          title={title.name}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title.name}
        </Box>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Header: cover beside the facts, on every screen size */}
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
          <Box
            sx={{
              position: "relative",
              width: { xs: 96, sm: 128 },
              aspectRatio: "2 / 3",
              flexShrink: 0,
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <CoverPlaceholder name={title.name} />
            {title.coverUrl && (
              <Box
                component="img"
                src={title.coverUrl}
                alt=""
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </Box>

          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            {title.avgRating != null && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <StarIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {title.avgRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  group average · {title.ratingCount}{" "}
                  {title.ratingCount === 1 ? "rating" : "ratings"}
                </Typography>
              </Stack>
            )}

            {title.mangaDexId && (
              <Typography variant="body2" color="textSecondary">
                {latestChapter === undefined
                  ? "Checking latest chapter…"
                  : latestChapter
                    ? `Latest in English: chapter ${latestChapter}`
                    : "No English chapters yet"}
              </Typography>
            )}

            {addedBy && (
              <Typography variant="body2" color="textSecondary">
                Added by {addedBy}
              </Typography>
            )}

            <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexWrap: "wrap", pt: 0.5 }}>
              {title.slop && (
                <Tooltip title={slopExplainer(addedBy)}>
                  <Chip icon={<FlagIcon />} label="Slop" color="error" tabIndex={0} />
                </Tooltip>
              )}
              {title.tags.slice(0, 6).map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </Stack>

        {/* Your take: the reason most people open this dialog */}
        <Stack spacing={2.5} sx={{ mt: 3 }}>
          {!isSignedIn && (
            <Alert
              severity="info"
              action={
                <Button color="inherit" onClick={signIn} sx={{ fontWeight: 600 }}>
                  Sign in
                </Button>
              }
            >
              Sign in to rate or track this title.
            </Alert>
          )}

          <ScorePicker
            label="Your rating"
            value={pendingScore !== undefined ? pendingScore : myScore}
            onChange={onScoreChange}
            disabled={!isSignedIn || ratings === undefined}
          />
          <StatusPicker
            label="Your status"
            value={pendingStatus !== undefined ? pendingStatus : myStatus}
            onChange={onStatusChange}
            disabled={!isSignedIn || statuses === undefined}
          />

          {actionError && <Alert severity="error">{actionError}</Alert>}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" component="h3" sx={sectionHeadingSx}>
          The group
        </Typography>
        {ratings && statuses ? (
          <GroupList
            ratings={ratings}
            statuses={statuses}
            users={users}
            currentUserId={currentUserId}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            Loading…
          </Typography>
        )}

        {description && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" component="h3" sx={sectionHeadingSx}>
              About
            </Typography>
            <Typography
              id="title-description"
              variant="body2"
              sx={{
                whiteSpace: "pre-line",
                maxWidth: "70ch",
                ...(isLongDescription &&
                  !showFullDescription && {
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }),
              }}
            >
              {description}
            </Typography>
            {isLongDescription && (
              <Button
                size="small"
                color="inherit"
                aria-expanded={showFullDescription}
                aria-controls="title-description"
                onClick={() => setShowFullDescription((s) => !s)}
                sx={{ mt: 0.5, ml: -1, color: "text.secondary", fontWeight: 500 }}
              >
                {showFullDescription ? "Show less" : "Show more"}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TitleDetailDialog;
