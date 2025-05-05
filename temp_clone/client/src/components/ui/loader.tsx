import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  className, 
  size = 24, 
  color = "currentColor", 
  ...props 
}) => {
  return (
    <div 
      className={cn("animate-spin", className)} 
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
};

export default Loader;