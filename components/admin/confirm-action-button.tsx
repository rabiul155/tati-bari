"use client";

import { useState, useTransition, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/features/admin/action-result";

// A button that asks for confirmation, runs a server action and shows its
// error, if any.
export function ConfirmActionButton({
  action,
  confirmMessage,
  children,
  ...buttonProps
}: {
  action: () => Promise<ActionResult | void>;
  confirmMessage?: string;
} & Omit<ComponentProps<typeof Button>, "onClick" | "action">) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        {...buttonProps}
        disabled={pending || buttonProps.disabled}
        onClick={() => {
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          setError(undefined);
          startTransition(async () => {
            const result = await action();
            if (result && !result.ok) setError(result.error ?? "Something went wrong.");
          });
        }}
      >
        {children}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
