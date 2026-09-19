import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">পাওয়া যায়নি</h1>
      <p className="text-muted-foreground">এই আইটেমটি নেই অথবা মুছে ফেলা হয়েছে।</p>
      <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
        ড্যাশবোর্ডে ফিরে যান
      </Link>
    </div>
  );
}
