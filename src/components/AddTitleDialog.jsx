import { useState } from "react";
import { useMutation } from "convex/react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Rating,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "../../convex/_generated/api";
import { STATUS_OPTIONS } from "../lib/constants";

// Confirm and edit a MangaDex search result before adding it to the list.
// Render with key={title.id} so the form resets for each new title.
function AddTitleDialog({ title, isSignedIn, onClose }) {
  const addTitle = useMutation(api.titles.addWithMetadata);

  const [description, setDescription] = useState(title.description);
  const [tagsInput, setTagsInput] = useState(title.tags.join(", "));
  const [score, setScore] = useState(null);
  const [status, setStatus] = useState("");
  const [isSlop, setIsSlop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const submit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await addTitle({
        name: title.name,
        description,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        coverUrl: title.coverUrl || undefined,
        mangaDexId: title.id,
        score: score ?? undefined,
        status: status || undefined,
        slop: isSlop,
      });
      onClose();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={close}>
      <DialogTitle>{title.name}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Description"
            multiline
            minRows={3}
            maxRows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Tags"
            helperText="Comma separated"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <Box>
            <Typography variant="body2" color="textSecondary" component="legend">
              Your rating (optional)
            </Typography>
            <Rating
              max={10}
              value={score}
              onChange={(_, value) => setScore(value)}
              disabled={!isSignedIn}
            />
          </Box>

          <TextField
            select
            label="Your status (optional)"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={!isSignedIn}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                color="error"
                checked={isSlop}
                onChange={(e) => setIsSlop(e.target.checked)}
              />
            }
            label="Mark as slop"
          />

          {!isSignedIn && <Alert severity="info">Sign in to add titles.</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={close} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} loading={isSubmitting} disabled={!isSignedIn}>
          Add title
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTitleDialog;
