"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function LoadingButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button aria-label="Loading" variant="outline" size="sm" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
