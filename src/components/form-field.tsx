"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.ComponentProps<"input"> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, hint, className, ...props }, ref) => {
    return (
      <div className="grid gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          ref={ref}
          className={cn(error && "border-destructive", className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
