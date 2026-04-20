"use client";

export function WatchLoader({ label = "データを読み込み中" }: { label?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-8">
      {/* 時計SVGアニメーション */}
      <div className="relative h-16 w-16">
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          style={{ filter: "drop-shadow(0 2px 8px rgba(139,0,0,0.15))" }}
        >
          {/* 文字盤 */}
          <circle cx="32" cy="32" r="28" fill="white" stroke="#8B0000" strokeWidth="2" />

          {/* 目盛り（12本） */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const r1 = i % 3 === 0 ? 22 : 24;
            const r2 = 26;
            return (
              <line
                key={i}
                x1={32 + r1 * Math.cos(angle)}
                y1={32 + r1 * Math.sin(angle)}
                x2={32 + r2 * Math.cos(angle)}
                y2={32 + r2 * Math.sin(angle)}
                stroke={i % 3 === 0 ? "#8B0000" : "#d6d3d1"}
                strokeWidth={i % 3 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* 時針（固定） */}
          <line
            x1="32"
            y1="32"
            x2="32"
            y2="20"
            stroke="#1c1917"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transformOrigin: "32px 32px",
              transform: "rotate(-30deg)",
            }}
          />

          {/* 分針（ゆっくり回転） */}
          <line
            x1="32"
            y1="32"
            x2="32"
            y2="14"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              transformOrigin: "32px 32px",
              animation: "minuteHand 4s linear infinite",
            }}
          />

          {/* 秒針（速く回転・赤） */}
          <line
            x1="32"
            y1="36"
            x2="32"
            y2="11"
            stroke="#8B0000"
            strokeWidth="1"
            strokeLinecap="round"
            style={{
              transformOrigin: "32px 32px",
              animation: "secondHand 1s steps(60, end) infinite",
            }}
          />

          {/* 中心点 */}
          <circle cx="32" cy="32" r="2" fill="#8B0000" />
        </svg>
      </div>

      {/* テキスト */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm uppercase tracking-widest text-stone-500">{label}</p>

        {/* ドット点滅 */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#8B0000]"
              style={{
                animation: "dotPulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
