import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Noto_Sans_Bengali, Noto_Serif_Bengali } from "next/font/google";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serif for headings (`font-heading`).
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

// The Latin fonts above have no Bengali glyphs; these are the fallbacks
// listed after them in globals.css.
const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-bengali-display",
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "bn_BD",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${notoSansBengali.variable} ${notoSerifBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
