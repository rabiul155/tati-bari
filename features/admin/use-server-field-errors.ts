"use client";

import { useCallback } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

// Shows field errors returned by a server action on the matching inputs.
export function useServerFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T, unknown, unknown>,
) {
  const { setError } = form;
  return useCallback(
    (fieldErrors: Record<string, string[] | undefined> | undefined) => {
      for (const [name, messages] of Object.entries(fieldErrors ?? {})) {
        if (messages?.[0]) setError(name as Path<T>, { message: messages[0] });
      }
    },
    [setError],
  );
}
