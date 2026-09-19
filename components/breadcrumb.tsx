import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

// The last item is the current page and is not a link. Long trails scroll
// sideways on narrow screens instead of wrapping onto several lines.
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="ব্রেডক্রাম্ব" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`} className="flex shrink-0 items-center gap-1">
              {index > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
              {item.href && !last ? (
                <Link href={item.href} className="py-1 underline-offset-4 hover:text-foreground hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("py-1", last && "font-medium text-foreground")}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
