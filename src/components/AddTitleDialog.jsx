import { useState } from "react";
import { useMutation } from "convex/react";
import { useClerk } from "@clerk/clerk-react";
import { ConvexError } from "convex/values";
import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { api } from "../../convex/_generated/api";
import { SLOP_EXPLAINER } from "../lib/constants";
import { friendlyError } from "../lib/errors";
import { useToast } from "../lib/toast";
import ScorePicker from "./ScorePicker";
import StatusPicker from "./StatusPicker";

// Add a MangaDex search result to the list, optionally with your rating and status.
// Description and tags come from MangaDex and are tucked away unless you want to edit them.
// Render with key={title.id} so the form resets for each new title.
function AddTitleDialog({ title, isSignedIn, onClose, onOpen }) {
  const addTitle = useMutation(api.titles.addWithMetadata);
  const notify = useToast();
  const clerk = useClerk();

  const [description, setDescription] = useState(title.description);
  const [tagsInput, setTagsInput] = useState(title.tags.join(", "));
  const [showDetails, setShowDetails] = useState(false);
  const [score, setScore] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSlop, setIsSlop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null); // { message, existingTitleId? }

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const titleId = await addTitle({
        name: title.name,
        description,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        coverUrl: title.coverUrl || undefined,
        mangaDexId: title.id,
        score: score ?? undefined,
        status: status ?? undefined,
        slop: isSlop,
      });
      onClose();
      notify(`Added ${title.name} to the list`, {
        label: "Open",
        onClick: () => onOpen(titleId),
      });
    } catch (err) {
      setError({
        message: friendlyError(
          err,
          "Couldn't add this title. Check your connection and try again.",
        ),
        existingTitleId: err instanceof ConvexError ? err.data?.titleId : undefined,
      });
      setIsSubmitting(false);
    }
  };

  const openExisting = () => {
    onClose();
    onOpen(error.existingTitleId);
  };

  const signIn = () => {
    onClose();
    clerk.openSignIn();
  };

  const disabled = !isSignedIn || isSubmitting;

  return (
    <Dialog open onClose={close} scroll="paper">
      <DialogTitle sx={{ pr: 7, lineHeight: 1.3 }}>
        Add {title.name}
        <IconButton
          aria-label="Close"
          onClick={close}
          disabled={isSubmitting}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {!isSignedIn && (
            <Alert
              severity="info"
              action={
                <Button color="inherit" onClick={signIn} sx={{ fontWeight: 600 }}>
                  Sign in
                </Button>
              }
            >
              Sign in to add titles to the list.
            </Alert>
          )}

          <ScorePicker
            label="Your rating (optional)"
            value={score}
            onChange={setScore}
            disabled={disabled}
          />
          <StatusPicker
            label="Your status (optional)"
            value={status}
            onChange={setStatus}
            disabled={disabled}
          />

          <FormControlLabel
            control={
              <Switch
                color="error"
                checked={isSlop}
                onChange={(e) => setIsSlop(e.target.checked)}
                disabled={disabled}
              />
            }
            label={
              <span>
                Mark as slop
                <Typography
                  component="span"
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "block" }}
                >
                  {SLOP_EXPLAINER}
                </Typography>
              </span>
            }
          />

          <div>
            <Button
              color="inherit"
              onClick={() => setShowDetails((s) => !s)}
              aria-expanded={showDetails}
              aria-controls="add-title-details"
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transition: "transform 150ms ease-out",
                    transform: showDetails ? "rotate(180deg)" : "none",
                  }}
                />
              }
              sx={{ ml: -1, color: "text.secondary", fontWeight: 500 }}
            >
              Edit description and tags
            </Button>
            <Collapse in={showDetails}>
              <Stack id="add-title-details" spacing={2.5} sx={{ pt: 2 }}>
                <TextField
                  label="Description"
                  multiline
                  minRows={3}
                  maxRows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={disabled}
                />
                <TextField
                  label="Tags"
                  helperText="Separate tags with commas"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={disabled}
                />
              </Stack>
            </Collapse>
          </div>

          {error && (
            <Alert
              severity={error.existingTitleId ? "info" : "error"}
              action={
                error.existingTitleId && (
                  <Button color="inherit" onClick={openExisting} sx={{ fontWeight: 600 }}>
                    Open it
                  </Button>
                )
              }
            >
              {error.message}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={close} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} loading={isSubmitting} disabled={!isSignedIn}>
          Add to list
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTitleDialog;
