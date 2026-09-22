import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeVideoForm } from "@/features/admin/home-videos/home-video-form";
import { getHomeVideos } from "@/features/home-videos/queries";
import { HOME_VIDEO_SLOTS } from "@/features/home-videos/slots";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "হোম পেজ ভিডিও" };

export default async function HomeVideosPage() {
  await requireAdmin();
  const videos = await getHomeVideos();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="হোম পেজ ভিডিও"
        description="হোম পেজের দুটি ইউটিউব ভিডিও পরিবর্তন করুন। সংরক্ষণ করলেই শপে দেখা যাবে।"
      />
      {HOME_VIDEO_SLOTS.map(({ slot, label }, index) => {
        const video = videos[index];
        return (
          <Card key={slot}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <HomeVideoForm
                slot={slot}
                defaultValues={{
                  title: video.title ?? "",
                  url: video.url,
                  isVisible: video.isVisible,
                }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
