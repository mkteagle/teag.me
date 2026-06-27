/**
 * Procedural, on-brand marketing visuals for the teag.me landing page.
 * These are lightweight inline-SVG placeholders (QR, charts, donut, bars,
 * map pins) — deterministic so server render is stable. Swap for real data /
 * QR + chart libraries when wiring the product.
 */

const MONO = "var(--font-mono)";
const HEADING = "var(--font-heading)";

/* ----------------------------------------------------------------------- *
 * QR code (procedural, believable matrix with finder patterns)
 * ----------------------------------------------------------------------- */

function qrMatrix(size: number, seed: number): boolean[][] {
  const m: boolean[][] = Array.from({ length: size }, () =>
    Array<boolean>(size).fill(false)
  );

  const placeFinder = (r: number, c: number) => {
    for (let i = 0; i <= 6; i++) {
      for (let j = 0; j <= 6; j++) {
        const border = i === 0 || i === 6 || j === 0 || j === 6;
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        m[r + i][c + j] = border || core;
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8);
      if (inFinder) continue;
      if (rand() > 0.52) m[r][c] = true;
    }
  }
  return m;
}

const QR_SIZE = 21;
const QR_HERO = qrMatrix(QR_SIZE, 1337);
const QR_PILLAR = qrMatrix(QR_SIZE, 4242);

export function MiniQR({
  px = 110,
  color = "#15181F",
  seed = "hero",
}: {
  px?: number;
  color?: string;
  seed?: "hero" | "pillar";
}) {
  const matrix = seed === "pillar" ? QR_PILLAR : QR_HERO;
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code preview"
    >
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect key={`${r}-${c}`} x={c} y={r} width={1.04} height={1.04} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
}

/* ----------------------------------------------------------------------- *
 * Charts
 * ----------------------------------------------------------------------- */

function buildPath(values: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return { line, area, pts };
}

const HERO_SERIES = [22, 30, 27, 38, 34, 46, 42, 55, 50, 63, 60, 72, 78, 92];

export function HeroAreaChart() {
  const w = 360;
  const h = 76;
  const { line, area } = buildPath(HERO_SERIES, w, h, 4);
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block h-[76px] w-full"
      role="img"
      aria-label="Scans over the last 14 days"
    >
      <defs>
        <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F7BFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0F7BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#heroArea)" />
      <path d={line} fill="none" stroke="#0F7BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DASH_SERIES = [
  30, 42, 38, 55, 48, 60, 52, 70, 64, 78, 72, 84, 80, 95, 88, 104, 98, 116,
];

export function DashboardLineChart() {
  const w = 520;
  const h = 190;
  const { line, area } = buildPath(DASH_SERIES, w, h, 8);
  const gridY = [0.25, 0.5, 0.75];
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block h-[190px] w-full"
      role="img"
      aria-label="Scans over time"
    >
      <defs>
        <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F7BFF" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#0F7BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridY.map((g) => (
        <line
          key={g}
          x1="0"
          x2={w}
          y1={g * h}
          y2={g * h}
          stroke="#15181F"
          strokeOpacity="0.06"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#dashArea)" />
      <path d={line} fill="none" stroke="#0F7BFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ----------------------------------------------------------------------- *
 * Devices donut
 * ----------------------------------------------------------------------- */

export function DevicesDonut({ px = 96 }: { px?: number }) {
  const r = 15.915; // circumference ~= 100
  const segments = [
    { value: 58, color: "#0F7BFF" },
    { value: 34, color: "#15181F" },
    { value: 8, color: "#FF8A3D" },
  ];
  let offset = 25; // start at top
  return (
    <svg width={px} height={px} viewBox="0 0 42 42" role="img" aria-label="Device breakdown">
      <circle cx="21" cy="21" r={r} fill="none" stroke="#15181F" strokeOpacity="0.06" strokeWidth="6" />
      {segments.map((seg, i) => {
        const dash = `${seg.value} ${100 - seg.value}`;
        const el = (
          <circle
            key={i}
            cx="21"
            cy="21"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="6"
            strokeDasharray={dash}
            strokeDashoffset={offset}
            transform="rotate(-90 21 21)"
            strokeLinecap="butt"
          />
        );
        offset -= seg.value;
        return el;
      })}
      <text
        x="21"
        y="22.6"
        textAnchor="middle"
        style={{ fontFamily: HEADING, fontWeight: 700 }}
        fontSize="7"
        fill="#15181F"
      >
        iOS
      </text>
    </svg>
  );
}

/* ----------------------------------------------------------------------- *
 * Horizontal bars — geography
 * ----------------------------------------------------------------------- */

const GEO = [
  { label: "United States", flag: "\u{1F1FA}\u{1F1F8}", value: 44 },
  { label: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", value: 16 },
  { label: "Germany", flag: "\u{1F1E9}\u{1F1EA}", value: 13 },
  { label: "Canada", flag: "\u{1F1E8}\u{1F1E6}", value: 8 },
  { label: "Other", flag: "\u{1F30D}", value: 19 },
];

export function GeographyBars() {
  const max = Math.max(...GEO.map((g) => g.value));
  return (
    <>
      {GEO.map((g) => (
        <div key={g.label} className="flex items-center gap-3">
          <span className="w-[18px] text-[13px] leading-none">{g.flag}</span>
          <span className="w-[110px] shrink-0 text-[12.5px] text-[#3C424E]">{g.label}</span>
          <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-[#15181F]/[0.06]">
            <div
              className="h-full rounded-full bg-[#0F7BFF]"
              style={{ width: `${(g.value / max) * 100}%` }}
            />
          </div>
          <span
            className="w-[34px] text-right text-[12px] text-[#5A606C]"
            style={{ fontFamily: MONO }}
          >
            {g.value}%
          </span>
        </div>
      ))}
    </>
  );
}

/* ----------------------------------------------------------------------- *
 * Device bars (pillar 3)
 * ----------------------------------------------------------------------- */

const DEVICES = [
  { label: "iOS", value: 58, color: "#0F7BFF" },
  { label: "Android", value: 34, color: "#15181F" },
  { label: "Desktop", value: 8, color: "#FF8A3D" },
];

export function DeviceBars() {
  return (
    <div className="flex flex-col gap-[10px]">
      {DEVICES.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-[58px] shrink-0 text-[12.5px] text-[#3C424E]">{d.label}</span>
          <div className="h-[9px] flex-1 overflow-hidden rounded-full bg-[#15181F]/[0.06]">
            <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
          </div>
          <span className="w-[34px] text-right text-[12px] text-[#5A606C]" style={{ fontFamily: MONO }}>
            {d.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 * Map pins for the scan-density panel
 * ----------------------------------------------------------------------- */

const PINS = [
  { left: "22%", top: "38%", size: 14 },
  { left: "30%", top: "52%", size: 9 },
  { left: "48%", top: "30%", size: 11 },
  { left: "55%", top: "60%", size: 8 },
  { left: "68%", top: "44%", size: 13 },
  { left: "78%", top: "34%", size: 7 },
  { left: "40%", top: "68%", size: 8 },
];

export function MapPins() {
  return (
    <>
      {PINS.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#0F7BFF]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 0 4px rgba(15,123,255,0.14)",
          }}
        />
      ))}
    </>
  );
}
