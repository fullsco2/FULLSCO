import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, ...props }, ref) => {
    // معالجة لتجنب التحول من uncontrolled إلى controlled
    // إذا كانت value غير محددة لكن defaultValue محددة، نستخدم uncontrolled input
    const isUncontrolled = value === undefined && props.defaultValue !== undefined;

    // أو إذا لم يكن هناك مستمع للتغييرات
    const hasNoChangeHandler = onChange === undefined;

    // إنشاء مستمع افتراضي للتغييرات إذا كانت القيمة محددة لكن بدون مستمع
    const handleChange = hasNoChangeHandler && value !== undefined
      ? (e: React.ChangeEvent<HTMLInputElement>) => {
          // مستمع افتراضي لمنع أخطاء React عن controlled inputs بدون مستمع
          console.log(`Input with value '${value}' has no onChange handler`);
        }
      : onChange;

    // إقرار ما إذا كان يجب استخدام value أو defaultValue
    const inputProps = isUncontrolled
      ? { ...props } // لا نقوم بتمرير value, نستخدم defaultValue المحددة في props
      : {
          ...props,
          value: value ?? '', // استخدام سلسلة فارغة إذا كانت value غير محددة
          onChange: handleChange,
        };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...inputProps}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
