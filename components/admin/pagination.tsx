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
    <nav className="flex items-center justify-between gap-2" aria-label="পেজিনেশন">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonVariants({ variant: "outline" })}>
          আগের
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        পৃষ্ঠা {Math.min(page, pageCount)} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={buttonVariants({ variant: "outline" })}>
          পরের
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
