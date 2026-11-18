import { createContext, useContext } from "react";

// Short confirmations ("Saved · 9/10") shown by ToastProvider.
// notify(message, action?) where action is { label, onClick }.
export const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}
