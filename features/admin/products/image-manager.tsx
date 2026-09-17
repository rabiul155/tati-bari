"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteProductImage,
  reorderProductImages,
  uploadProductImage,
} from "@/features/admin/products/actions";
import { MAX_IMAGES_PER_PRODUCT, MAX_UPLOAD_BYTES } from "@/features/admin/products/constants";
import { resizeImageForUpload } from "@/features/admin/products/resize-image";

type ProductImage = { id: string; url: string };

// Photos for one product: upload, reorder, choose the main photo, delete.
// Changes are saved immediately. Render with a `key` derived from the image
// ids so local state resets when the server sends new data.
export function ImageManager({
  productId,
  productName,
  images: initialImages,
}: {
  productId: string;
  productName: string;
  images: ProductImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);
  const remaining = MAX_IMAGES_PER_PRODUCT - images.length;

  function saveOrder(next: ProductImage[]) {
    const previous = images;
    setImages(next);
    setError(undefined);
    startTransition(async () => {
      const result = await reorderProductImages(productId, next.map((image) => image.id));
      if (!result.ok) {
        setImages(previous);
        setError(result.error);
      }
    });
  }

  function move(index: number, to: number) {
    const next = [...images];
    const [image] = next.splice(index, 1);
    next.splice(to, 0, image);
    saveOrder(next);
  }

  function remove(image: ProductImage) {
    if (!window.confirm("Delete this photo?")) return;
    setError(undefined);
    startTransition(async () => {
      const result = await deleteProductImage(image.id);
      if (!result.ok) setError(result.error);
    });
  }

  function upload(files: File[]) {
    if (files.length === 0) return;
    setError(undefined);
    const batch = files.slice(0, remaining);
    const skipped = files.length - batch.length;
    startTransition(async () => {
      const failures: string[] = [];
      for (const [index, file] of batch.entries()) {
        setStatus(`Uploading ${index + 1} of ${batch.length}…`);
        try {
          const resized = await resizeImageForUpload(file);
          if (resized.size > MAX_UPLOAD_BYTES) {
            failures.push(`${file.name}: too large (maximum 4 MB).`);
            continue;
          }
          const formData = new FormData();
          formData.append("file", resized);
          const result = await uploadProductImage(productId, formData);
          if (!result.ok) failures.push(`${file.name}: ${result.error}`);
        } catch {
          failures.push(`${file.name}: could not be uploaded.`);
        }
      }
      setStatus(undefined);
      if (skipped > 0) {
        failures.push(`${skipped} photo(s) skipped: the limit is ${MAX_IMAGES_PER_PRODUCT}.`);
      }
      if (failures.length > 0) setError(failures.join(" "));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No photos yet. Products without photos look unfinished in the shop.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="flex flex-col gap-2 rounded-lg border p-2">
              <div className="relative aspect-3/4 overflow-hidden rounded-md bg-muted">
                <Image
                  src={image.url}
                  alt={`${productName}, photo ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
                {index === 0 && <Badge className="absolute top-2 left-2">Main photo</Badge>}
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Move left"
                    disabled={pending || index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Move right"
                    disabled={pending || index === images.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowRight />
                  </Button>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Make main photo"
                      title="Make main photo"
                      disabled={pending}
                      onClick={() => move(index, 0)}
                    >
                      <Star />
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  aria-label="Delete photo"
                  disabled={pending}
                  onClick={() => remove(image)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            upload(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending || remaining <= 0}
          onClick={() => fileInput.current?.click()}
        >
          Add photos
        </Button>
        <span role="status" className="text-sm text-muted-foreground">
          {status ??
            (remaining <= 0
              ? `Photo limit reached (${MAX_IMAGES_PER_PRODUCT}).`
              : "The first photo is the main one. Tall (portrait) photos look best.")}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
