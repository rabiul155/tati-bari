import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Default social preview for pages without their own image.
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#fbf8f3",
          color: "#8a1c2b",
          borderTop: "24px solid #8a1c2b",
          borderBottom: "24px solid #c9a24a",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>{site.name}</div>
        <div style={{ fontSize: 40, color: "#4a3b33" }}>{site.tagline}</div>
        <div style={{ fontSize: 28, color: "#6b5a50" }}>Cash on delivery across Bangladesh</div>
      </div>
    ),
    size,
  );
}
