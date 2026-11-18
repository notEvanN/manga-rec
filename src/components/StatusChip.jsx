import { Box } from "@mui/material";
import { STATUS_COLORS, STATUS_LABELS } from "../lib/constants";

// Read status in its own colour. Used in the activity feed and the title dialog.
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
        whiteSpace: "nowrap",
        color,
        bgcolor: bg,
      }}
    >
      {STATUS_LABELS[status]}
    </Box>
  );
}

export default StatusChip;
