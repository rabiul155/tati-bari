import { readLocalUpload } from "@/lib/storage/local";

// Serves images saved by the local storage driver (development only).
export async function GET(_request: Request, ctx: RouteContext<"/uploads/[name]">) {
  const { name } = await ctx.params;
  const file = await readLocalUpload(name);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "image/webp",
      // File names are unique per upload, so they never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
