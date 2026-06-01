import { ImageResponse } from "next/og";

// Generated app/favicon icon — the brand water droplet on the site's gradient.
// Next injects <link rel="icon" href="/icon?..."> into <head> automatically and
// the web manifest references /icon for installability.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
        <svg width="320" height="320" viewBox="0 0 24 24" fill="#38bdf8">
          <path d="M12 2c-4 6-7 9.6-7 13a7 7 0 0 0 14 0c0-3.4-3-7-7-13Z" />
        </svg>
      </div>
    ),
    size,
  );
}
