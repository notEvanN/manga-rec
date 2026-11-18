import { useId } from "react";
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { SCORES } from "../lib/constants";

// 1–10 as a row of 44px number buttons (two rows of five on phones), with the score read out large.
// Tapping the selected number again, or "Clear", calls onChange(null).
function ScorePicker({ label, value, onChange, disabled }) {
  const labelId = useId();

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1, minHeight: 32 }}
      >
        <Typography id={labelId} variant="subtitle2" component="h3">
          {label}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
          {value != null && (
            <Button
              size="small"
              color="inherit"
              onClick={() => onChange(null)}
              disabled={disabled}
              sx={{ color: "text.secondary", fontWeight: 500, minWidth: 0 }}
            >
              Clear
            </Button>
          )}
          <Typography
            aria-hidden
            sx={{
              fontFamily: "h3.fontFamily",
              fontWeight: 700,
              fontSize: "1.5rem",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: value != null ? "text.primary" : "text.secondary",
            }}
          >
            {value ?? "–"}
            <Box component="span" sx={{ fontSize: "1rem", color: "text.secondary" }}>
              /10
            </Box>
          </Typography>
        </Stack>
      </Stack>

      <ToggleButtonGroup
        exclusive
        aria-labelledby={labelId}
        value={value}
        onChange={(_, score) => onChange(score)}
        disabled={disabled}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(5, 1fr)", sm: "repeat(10, 1fr)" },
          gap: 0.75,
          "& .MuiToggleButton-root": {
            // Undo the group's merged, squared-off borders: each number is its own button.
            "&.MuiToggleButtonGroup-grouped": {
              m: 0,
              border: "1px solid var(--border)",
              borderRadius: "10px",
            },
            minWidth: 0,
            fontSize: "1rem",
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: "text.primary",
            transition: "background-color 120ms ease-out, border-color 120ms ease-out",
            "&:hover": { bgcolor: "var(--panel-raised)" },
            "&.Mui-selected, &.Mui-selected:hover": {
              bgcolor: "var(--accent-soft)",
              color: "primary.main",
              borderColor: "primary.main",
            },
            "&.Mui-focusVisible": { outline: "2px solid var(--accent)", outlineOffset: 2 },
          },
        }}
      >
        {SCORES.map((score) => (
          <ToggleButton key={score} value={score} aria-label={`${score} out of 10`}>
            {score}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

export default ScorePicker;
