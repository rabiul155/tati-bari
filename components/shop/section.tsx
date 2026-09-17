import Link from "next/link";
import type { ReactNode } from "react";

export function Section({
  title,
  description,
  link,
  children,
}: {
  title: string;
  description?: string;
  link?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {link && (
          <Link href={link.href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {link.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
