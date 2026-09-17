import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="text-muted-foreground">This item doesn&apos;t exist or was deleted.</p>
      <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
        Back to dashboard
      </Link>
    </div>
  );
}
