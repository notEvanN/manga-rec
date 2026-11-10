export const STATUS_OPTIONS = [
  { value: "plan_to_read", label: "Plan to Read" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

export const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]));

export const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
