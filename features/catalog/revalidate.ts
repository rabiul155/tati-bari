import "server-only";
import { revalidatePath } from "next/cache";

// Call after any product, category or image change. The catalog appears on
// most storefront pages, so everything is refreshed; the store is small
// enough that this is cheap.
export function revalidateCatalog() {
  revalidatePath("/", "layout");
}
