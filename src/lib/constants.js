export const STATUS_OPTIONS = [
  { value: "plan_to_read", label: "Plan to Read" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

export const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]));

export const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// [text colour, background] per status. Status hues are used for read status and nothing else.
export const STATUS_COLORS = {
  reading: ["var(--status-reading)", "var(--status-reading-bg)"],
  completed: ["var(--status-completed)", "var(--status-completed-bg)"],
  dropped: ["var(--status-dropped)", "var(--status-dropped-bg)"],
  plan_to_read: ["var(--status-plan)", "var(--status-plan-bg)"],
};

// Slop is set once, by whoever adds the title; say who, never "the group".
export const slopExplainer = (name) =>
  name ? `Flagged by ${name} as not worth the time` : "Flagged as not worth the time";
