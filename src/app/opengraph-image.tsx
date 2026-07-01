import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} - ${siteConfig.role}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#111114",
        color: "#f4f4f1",
        padding: "52px 64px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 32,
              background: "#f4f4f1",
              color: "#111114",
              fontFamily: "serif",
              fontSize: 38,
              fontStyle: "italic",
            }}
          >
            I
          </div>
          <span style={{ fontSize: 24, fontWeight: 700 }}>
            IQMAL / PORTFOLIO
          </span>
        </div>
        <span style={{ color: "#aeb8b0", fontSize: 24 }}>iqmal.dev</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 92,
          width: "100%",
        }}
      >
        <span style={{ color: "#aeb8b0", fontSize: 24 }}>
          CENTRAL JAVA · INDONESIA
        </span>
        <div
          style={{
            display: "flex",
            width: "100%",
            fontSize: 62,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          Muhammad Fatihul Iqmal
        </div>
        <span style={{ color: "#d2d2cf", fontSize: 34 }}>
          Full-Stack Web Developer
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: "auto",
        }}
      >
        {["NEXT.JS", "TYPESCRIPT", "LARAVEL", "POSTGRESQL"].map((skill) => (
          <span
            key={skill}
            style={{
              display: "flex",
              border: "1px solid #3d403f",
              borderRadius: 6,
              padding: "10px 16px",
              color: "#aeb8b0",
              fontSize: 18,
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>,
    size,
  );
}
