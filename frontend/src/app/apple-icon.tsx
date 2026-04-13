import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };

export const contentType = "image/png";

/** Apple Touch Icon（ホーム画面追加時など）。icon.svg と同系のグラデ + 「K」。 */
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
          background: "linear-gradient(135deg, #0369a1 0%, #0d9488 55%, #0891b2 100%)",
          borderRadius: 40,
        }}
      >
        <span
          style={{
            fontSize: 102,
            fontWeight: 800,
            color: "#ffffff",
            fontFamily:
              'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Noto Sans JP", "Noto Sans KR", sans-serif',
            lineHeight: 1,
            marginTop: -6,
          }}
        >
          K
        </span>
      </div>
    ),
    { ...size },
  );
}
