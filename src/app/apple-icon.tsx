import { ImageResponse } from "next/og";

// Generated apple-touch-icon (180×180). Apple masks the corners and ignores
// transparency, so the gradient fills the full square. Same droplet as /icon.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b1220 0%, #0ea5e9 130%)",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 24 24" fill="#38bdf8">
          <path d="M12 2c-4 6-7 9.6-7 13a7 7 0 0 0 14 0c0-3.4-3-7-7-13Z" />
        </svg>
      </div>
    ),
    size,
  );
}
