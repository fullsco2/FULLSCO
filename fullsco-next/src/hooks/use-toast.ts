// تم نسخ هذا من shadcn/ui toast
// https://ui.shadcn.com/docs/components/toast

import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastOriginal,
} from "@/components/ui/use-toast";

type ToastActionProps = React.ComponentPropsWithoutRef<typeof ToastActionElement>;

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionProps;
};

export const useToast = useToastOriginal;
