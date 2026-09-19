"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Mobile-only tab bar fixed to the bottom of the screen. It
// also renders a spacer so page content and footers are never covered.
export function BottomNav({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div aria-hidden className="h-(--bottom-nav-h) md:hidden" />
      <nav
        aria-label={label}
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex h-16 max-w-md items-stretch px-2">{children}</ul>
      </nav>
    </>
  );
}

const itemClass =
  "group relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg text-[0.6875rem] leading-tight outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50";

function ItemBody({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <>
      <span
        className={cn(
          "relative flex h-7 w-12 items-center justify-center rounded-full transition-colors",
          active && "bg-primary/10",
        )}
      >
        <Icon
          className={cn("size-5", active && "fill-primary/20")}
          strokeWidth={active ? 2.25 : 1.75}
          aria-hidden
        />
        {badge ? (
          <span className="absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-semibold text-primary-foreground tabular-nums">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="max-w-full truncate px-0.5">{label}</span>
    </>
  );
}

export function BottomNavLink({
  href,
  icon,
  label,
  active,
  badge,
  ariaLabel,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
  ariaLabel?: string;
}) {
  return (
    <li className="flex-1">
      <Link
        href={href}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
        className={cn(itemClass, active ? "font-semibold text-primary" : "text-muted-foreground")}
      >
        <ItemBody icon={icon} label={label} active={active} badge={badge} />
      </Link>
    </li>
  );
}
