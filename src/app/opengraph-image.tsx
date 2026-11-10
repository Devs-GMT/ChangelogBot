import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GROUPS = [
  { label: "New", color: "#16a34a", bg: "#e8f7ee", text: "One-click switch to BOT Chain testnet" },
  { label: "Improved", color: "#2563eb", bg: "#e8effd", text: "Repos load instantly on repeat visits" },
  { label: "Fixed", color: "#ea580c", bg: "#fdeee4", text: "Repos without tags work again" },
];

/** Social card: headline on the left, a release-notes card on the right, violet bloom behind. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(110,86,207,0.22), transparent 45%), radial-gradient(circle at 0% 100%, rgba(110,86,207,0.10), transparent 40%)",
          padding: 72,
          fontFamily: "sans-serif",
          color: "#111318",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700 }}>
            <svg width="56" height="56" viewBox="0 0 64 64">
              <rect x="16" y="6" width="40" height="26" rx="8" fill="#E4DDFF" />
              <rect x="11" y="16" width="42" height="27" rx="8" fill="#B9A8FF" />
              <rect x="6" y="27" width="46" height="31" rx="9" fill="#6E56CF" />
              <path d="M16 37.5h18M16 44h26M16 50.5h12" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M46 34l1.6 3.9 3.9 1.6-3.9 1.6L46 45l-1.6-3.9-3.9-1.6 3.9-1.6L46 34Z" fill="#fff" />
            </svg>
            {siteConfig.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Release notes,</div>
            <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: "#646b78" }}>
              built for the AI era.
            </div>
            <div style={{ marginTop: 28, fontSize: 26, color: "#646b78", lineHeight: 1.4 }}>
              Reads your commits, writes notes people enjoy, records every release on BOT Chain.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 470,
              background: "#ffffff",
              border: "1px solid #e7e9ee",
              borderRadius: 24,
              padding: 30,
              gap: 20,
              boxShadow: "0 40px 80px -30px rgba(49,32,120,0.45)",
              transform: "rotate(-2deg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "monospace" }}>v1.4.0</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 17,
                  color: "#6E56CF",
                  background: "#f1eefc",
                  borderRadius: 999,
                  padding: "6px 14px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E56CF" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Recorded on BOT Chain
              </div>
            </div>
            {GROUPS.map((g) => (
              <div key={g.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignSelf: "flex-start",
                    fontSize: 16,
                    fontWeight: 600,
                    color: g.color,
                    background: g.bg,
                    borderRadius: 999,
                    padding: "4px 12px",
                  }}
                >
                  {g.label}
                </div>
                <div style={{ fontSize: 21, color: "#111318" }}>{g.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
