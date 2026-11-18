import { useCallback, useState } from "react";
import { Button, Snackbar } from "@mui/material";
import { ToastContext } from "../lib/toast";

// One toast at a time; a new one replaces the current one. MUI's Snackbar is a live region, so
// screen readers announce each confirmation.
function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, action) => {
    setToast({ message, action, key: Date.now() });
  }, []);

  const close = (_, reason) => {
    if (reason !== "clickaway") setToast(null);
  };

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        onClose={close}
        autoHideDuration={toast?.action ? 6000 : 3000}
        message={toast?.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          toast?.action && (
            <Button
              color="primary"
              onClick={() => {
                toast.action.onClick();
                setToast(null);
              }}
            >
              {toast.action.label}
            </Button>
          )
        }
        slotProps={{
          content: {
            sx: {
              bgcolor: "var(--panel-raised)",
              color: "text.primary",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontWeight: 500,
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
