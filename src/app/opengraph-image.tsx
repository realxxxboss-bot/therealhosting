import { renderOgImage, ogSize } from "@/lib/og";
import { site } from "@/config/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: "Your websites, looked after by real people.", eyebrow: "Managed hosting for Next.js, WordPress and static sites" });
}
