"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-3/4 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        Photo coming soon
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-muted">
        <Image
          key={current.id}
          src={current.url}
          alt={images.length > 1 ? `${name}, photo ${selected + 1} of ${images.length}` : name}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === selected}
                className={cn(
                  "relative block aspect-3/4 w-full overflow-hidden rounded-md bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  index === selected ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image.url} alt="" fill sizes="20vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
