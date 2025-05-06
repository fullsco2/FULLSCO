// Adapted from shadcn-ui/ui/use-toast.ts
import { useState, useEffect, useCallback } from 'react';

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

export const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString(36);
}

type Action =
  | {
      type: 'ADD_TOAST';
      toast: ToasterToast;
    }
  | {
      type: 'UPDATE_TOAST';
      toast: Partial<ToasterToast>;
      id: string;
    }
  | {
      type: 'DISMISS_TOAST';
      id: string;
    }
  | {
      type: 'REMOVE_TOAST';
      id: string;
    };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: ToastState, action: Action): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        toasts: [
          action.toast,
          ...state.toasts.filter((t) => t.id !== action.toast.id),
        ].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { id } = action;

      // Cancel any existing timeout
      if (toastTimeouts.has(id)) {
        clearTimeout(toastTimeouts.get(id));
        toastTimeouts.delete(id);
      }

      return {
        toasts: state.toasts.map((t) =>
          t.id === id
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case 'REMOVE_TOAST':
      if (action.id === 'all') {
        return {
          toasts: [],
        };
      }
      return {
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };

    default:
      return state;
  }
};

const useToastStore = () => {
  const [state, setState] = useState<ToastState>({ toasts: [] });

  const dispatch = useCallback((action: Action) => {
    setState((prevState) => reducer(prevState, action));
  }, []);

  const toast = useCallback((props: Omit<ToasterToast, 'id'>) => {
    const id = generateId();

    const update = (props: ToasterToast) =>
      dispatch({
        type: 'UPDATE_TOAST',
        id,
        toast: props,
      });

    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', id });

    dispatch({
      type: 'ADD_TOAST',
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss();
        },
      },
    });

    return {
      id,
      dismiss,
      update,
    };
  }, [dispatch]);

  useEffect(() => {
    state.toasts.forEach((t) => {
      if (t.open && !toastTimeouts.has(t.id)) {
        const timeout = setTimeout(() => {
          dispatch({ type: 'DISMISS_TOAST', id: t.id });

          // This one is a bit different
          // We need to set another timeout to remove the toast completely
          setTimeout(() => {
            dispatch({ type: 'REMOVE_TOAST', id: t.id });
          }, TOAST_REMOVE_DELAY);
        }, 5000);

        toastTimeouts.set(t.id, timeout);
      }
    });

    // Cleanup timeouts
    return () => {
      toastTimeouts.forEach((timeout) => clearTimeout(timeout));
      toastTimeouts.clear();
    };
  }, [state.toasts, dispatch]);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (id: string) => dispatch({ type: 'DISMISS_TOAST', id }),
    remove: (id: string) => dispatch({ type: 'REMOVE_TOAST', id }),
  };
};

export function useToast() {
  const store = useToastStore();

  return {
    ...store,
    toast: store.toast,
    dismiss: store.dismiss,
    remove: store.remove,
  };
}