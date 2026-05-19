import { useState, useEffect } from "react";

const TOAST_LIMIT = 10;
const AUTO_DISMISS = 5000; // 5 seconds

export type ToastVariant = "default" | "destructive";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastVariant;
  open?: boolean;
  duration?: number;
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; toastId: string }
  | { type: "REMOVE_TOAST"; toastId: string };

interface State {
  toasts: Toast[];
}

let count = 0;
const genId = () => (++count).toString();

// Auto-remove timers
const removeTimers = new Map<string, NodeJS.Timeout>();
const autoDismissMap = new Map<string, NodeJS.Timeout>();

function scheduleRemove(id: string) {
  if (removeTimers.has(id)) return;
  const t = setTimeout(() => {
    removeTimers.delete(id);
    dispatch({ type: "REMOVE_TOAST", toastId: id });
  }, 400); // short delay for exit animation
  removeTimers.set(id, t);
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };

    case "DISMISS_TOAST":
      // Cancel auto-dismiss timer if manually closed
      const autoDismiss = autoDismissMap.get(action.toastId);
      if (autoDismiss) {
        clearTimeout(autoDismiss);
        autoDismissMap.delete(action.toastId);
      }
      // Schedule DOM removal
      scheduleRemove(action.toastId);
      // Mark as closed (triggers exit animation)
      return {
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t,
        ),
      };

    case "REMOVE_TOAST":
      return { toasts: state.toasts.filter((t) => t.id !== action.toastId) };

    default:
      return state;
  }
}

type Listener = (state: State) => void;
const listeners: Listener[] = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

interface ToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

function toast(options: ToastOptions) {
  const id = genId();
  const duration = options.duration ?? AUTO_DISMISS;

  dispatch({ type: "ADD_TOAST", toast: { ...options, id, open: true } });

  // Auto-dismiss after duration
  const timer = setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
    autoDismissMap.delete(id);
  }, duration);
  autoDismissMap.set(id, timer);

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

function useToast() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, [state]);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

export { useToast, toast };
