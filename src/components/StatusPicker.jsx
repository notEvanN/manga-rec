import { useId } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { STATUS_COLORS, STATUS_OPTIONS } from "../lib/constants";

// The four read statuses as buttons (2×2 on phones). The selected one takes its status colour, the
// same as the chips in the activity feed. Tapping it again calls onChange(null).
function StatusPicker({ label, value, onChange, disabled }) {
  const labelId = useId();

  return (
    <Box>
      <Typography id={labelId} variant="subtitle2" component="h3" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        exclusive
        aria-labelledby={labelId}
        value={value}
        onChange={(_, status) => onChange(status)}
        disabled={disabled}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 0.75,
          "& .MuiToggleButton-root": {
            "&.MuiToggleButtonGroup-grouped": {
              m: 0,
              border: "1px solid var(--border)",
              borderRadius: "10px",
            },
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "text.primary",
            whiteSpace: "nowrap",
            transition: "background-color 120ms ease-out, border-color 120ms ease-out",
            "&:hover": { bgcolor: "var(--panel-raised)" },
            "&.Mui-focusVisible": { outline: "2px solid var(--accent)", outlineOffset: 2 },
          },
        }}
      >
        {STATUS_OPTIONS.map(({ value: status, label: statusLabel }) => {
          const [color, bg] = STATUS_COLORS[status];
          return (
            <ToggleButton
              key={status}
              value={status}
              sx={{
                "&.Mui-selected, &.Mui-selected:hover": {
                  color,
                  bgcolor: bg,
                  borderColor: `${color} !important`,
                },
              }}
            >
              {statusLabel}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}

export default StatusPicker;
