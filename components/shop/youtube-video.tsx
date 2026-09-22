import { youTubeVideoId } from "@/features/home-videos/slots";

// Home page video section. Renders nothing when the slot is hidden or its
// link is not a YouTube video.
export function YouTubeVideo({
  title,
  url,
  isVisible,
}: {
  title: string | null;
  url: string;
  isVisible: boolean;
}) {
  const id = youTubeVideoId(url);
  if (!isVisible || !id) return null;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      {title && (
        <h2 className="text-center font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      )}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-sm">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title={title ?? "ইউটিউব ভিডিও"}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </section>
  );
}
