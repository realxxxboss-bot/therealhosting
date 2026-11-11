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
          background: "#0014A8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="8" fill="#ffffff" />
            <path d="M17 16.5h30v7.2L29.4 40.3H47v7.2H17v-7.2l17.6-16.6H17z" fill="#0014A8" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>zaffre</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow ? <div style={{ fontSize: 28, color: "#C9CFF6" }}>{eyebrow}</div> : null}
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#E9ECFB" }}>
          <div>{site.domain}</div>
          <div>{site.tagline}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
