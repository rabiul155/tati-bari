"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_QUANTITY_PER_ITEM } from "@/features/cart/cart-schema";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  label = "পরিমাণ",
  size = "default",
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: "default" | "sm";
  disabled?: boolean;
}) {
  const buttonSize = size === "sm" ? "icon-sm" : "icon-lg";
  return (
    <div className="inline-flex items-center rounded-lg border" role="group" aria-label={label}>
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        aria-label="পরিমাণ কমান"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <output
        aria-live="polite"
        className={cn("text-center font-medium tabular-nums", size === "sm" ? "w-7 text-sm" : "w-10")}
      >
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        aria-label="পরিমাণ বাড়ান"
        disabled={disabled || value >= MAX_QUANTITY_PER_ITEM}
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
