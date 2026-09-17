import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  href,
}: {
  page: number;
  pageCount: number;
  href: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonVariants({ variant: "outline" })}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        Page {Math.min(page, pageCount)} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={buttonVariants({ variant: "outline" })}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function pageParam(value: string | string[] | undefined): number {
  return Math.max(1, Number.parseInt(firstParam(value), 10) || 1);
}
