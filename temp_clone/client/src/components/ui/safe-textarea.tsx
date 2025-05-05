import React from "react";
import { Textarea } from "./textarea";

interface SafeTextareaProps {
  value: string | null | undefined;
  [key: string]: any;
}

export function SafeTextarea({ value, ...props }: SafeTextareaProps) {
  return <Textarea value={value || ''} {...props} />;
}