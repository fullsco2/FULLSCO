import React from "react";
import { Checkbox } from "./checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

interface SafeCheckboxProps {
  checked: boolean | null | undefined;
  onCheckedChange?: (checked: CheckedState) => void;
  [key: string]: any;
}

export function SafeCheckbox({ checked, ...props }: SafeCheckboxProps) {
  return <Checkbox checked={checked || false} {...props} />;
}