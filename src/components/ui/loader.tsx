import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary";
}

const Loader = ({
  size = "md",
  variant = "primary",
  className,
  ...props
}: LoaderProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const variantClasses = {
    default: "border-foreground/20 border-t-foreground",
    primary: "border-primary/20 border-t-primary",
    secondary: "border-secondary/20 border-t-secondary",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          "rounded-full bg-background",
          size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-3 h-3" : "w-5 h-5"
        )} />
      </div>
    </div>
  );
};

export { Loader };