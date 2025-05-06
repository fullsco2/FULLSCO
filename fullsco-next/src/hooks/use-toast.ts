// الاستيراد من مكتبة shadcn/ui
import {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

import { useToast as useToastImpl } from "@/components/ui/use-toast";

type ToastOptions = Omit<ToastProps, "children"> & {
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const useToast = () => {
  const { toast, dismiss, toasts } = useToastImpl();

  return {
    toast: ({ description, action, ...props }: ToastOptions) => {
      return toast({ ...props, description, action });
    },
    dismiss,
    toasts,
  };
};
