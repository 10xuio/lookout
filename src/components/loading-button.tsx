"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function LoadingButton({
  children,
  variant,
  size,
  ...props
}: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-label="Loading"
      variant={variant ?? "outline"}
      size={size ?? "sm"}
      disabled={pending}
      {...props}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
