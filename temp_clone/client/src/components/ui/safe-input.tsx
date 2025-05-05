import React from "react";
import { Input } from "./input";

interface SafeInputProps {
  value: string | null | undefined;
  [key: string]: any;
}

export function SafeInput({ value, ...props }: SafeInputProps) {
  return <Input value={value || ''} {...props} />;
}