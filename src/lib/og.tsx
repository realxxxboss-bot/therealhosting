import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };

/** Shared Open Graph image template. Use from any opengraph-image.tsx file. */
export function renderOgImage({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#ffffff",
          background: "linear-gradient(135deg, #2A3BF0 0%, #0014A8 45%, #070A3A 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#ffffff" fillOpacity="0.12" />
            <path d="M17 16.5h30v7.2L29.4 40.3H47v7.2H17v-7.2l17.6-16.6H17z" fill="#ffffff" />
            <rect x="40.5" y="40.3" width="6.5" height="7.2" rx="1.2" fill="#38D6F5" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5 }}>zaffre</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow ? <div style={{ fontSize: 28, color: "#BCC7FF" }}>{eyebrow}</div> : null}
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, maxWidth: 980 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#DDE3FF" }}>
          <div>{site.domain}</div>
          <div>{site.tagline}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
