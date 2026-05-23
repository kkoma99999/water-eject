import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo/siteConfig";

export const runtime = "edge";
export const alt = siteConfig.name;
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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1220 0%, #0ea5e9 120%)",
          color: "#e2e8f0",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "28px",
            color: "#38bdf8",
            fontWeight: 600,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#38bdf8">
            <path d="M12 2c-4 6-7 9.6-7 13a7 7 0 0 0 14 0c0-3.4-3-7-7-13Z" />
          </svg>
          Water Eject
        </div>
        <div
          style={{
            marginTop: "32px",
            fontSize: "76px",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: "1000px",
          }}
        >
          Remove water from your phone speaker.
        </div>
        <div
          style={{
            marginTop: "24px",
            fontSize: "30px",
            color: "#94a3b8",
            maxWidth: "900px",
          }}
        >
          A free in-browser tool that plays a low-frequency tone to vibrate water out — no app needed.
        </div>
      </div>
    ),
    size,
  );
}
