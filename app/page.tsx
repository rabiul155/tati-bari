import { Button } from "@/components/ui/button";

// Temporary placeholder; the real storefront home page is built in Phase 5.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Tangail Saree</h1>
      <p className="text-muted-foreground">Our store is coming soon.</p>
      <Button disabled>Shop sarees</Button>
    </main>
  );
}
