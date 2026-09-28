import type { Glyph } from "@/content/projects";

/**
 * Small line-art motif for each project, used in place of screenshots.
 * Pure SVG in the accent color; parents add `group` to enable hover motion.
 */
export function ProjectGlyph({ glyph, className = "" }: { glyph: Glyph; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={`h-full w-full text-accent ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      aria-hidden
    >
      {GLYPHS[glyph]}
    </svg>
  );
}

const tileOpacity = [
  0.05, 0.15, 0.3, 0.1, 0.5, 0.2, 0.08, 0.35, 0.12, 0.6, 0.25, 0.05, 0.18, 0.4, 0.1, 0.9, 0.3, 0.15, 0.22, 0.07, 0.45, 0.2,
  0.55, 0.1, 0.3, 0.12, 0.05, 0.28, 0.16, 0.38,
];

const GLYPHS: Record<Glyph, React.ReactNode> = {
  // Satellite tiles with one detection highlighted.
  tiles: (
    <g className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" style={{ transformOrigin: "200px 150px" }}>
      {Array.from({ length: 30 }, (_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <rect
            key={i}
            x={62 + col * 46}
            y={42 + row * 46}
            width={40}
            height={40}
            rx={3}
            fill="currentColor"
            fillOpacity={tileOpacity[i]}
            strokeOpacity={0.35}
          />
        );
      })}
      <rect x={196} y={174} width={52} height={52} rx={4} strokeWidth={1.8} className="transition-opacity duration-500" />
      <path d="M222 150v18M222 232v18M172 200h18M254 200h18" strokeWidth={1.4} />
    </g>
  ),

  // Stacked swipe cards.
  swipe: (
    <g>
      <rect x={140} y={62} width={120} height={170} rx={12} strokeOpacity={0.3} transform="rotate(-10 200 147)" />
      <rect x={140} y={62} width={120} height={170} rx={12} strokeOpacity={0.55} transform="rotate(-4 200 147)" />
      <g className="transition-transform duration-700 ease-out group-hover:translate-x-6 group-hover:rotate-6" style={{ transformOrigin: "200px 240px" }}>
        <rect x={140} y={62} width={120} height={170} rx={12} fill="var(--bg-elevated)" strokeWidth={1.6} />
        <rect x={156} y={78} width={88} height={96} rx={6} fill="currentColor" fillOpacity={0.12} strokeOpacity={0.5} />
        <path d="M156 192h60M156 206h40" strokeOpacity={0.6} />
        <path d="M218 212c-6-5-11-9-11-13a5 5 0 0 1 11-2 5 5 0 0 1 11 2c0 4-5 8-11 13Z" fill="currentColor" fillOpacity={0.6} />
      </g>
    </g>
  ),

  // Face landmarks inside a detection box.
  face: (
    <g>
      <path d="M130 70v-20h20M270 70v-20h-20M130 230v20h20M270 230v20h-20" strokeWidth={1.8} />
      <g className="transition-transform duration-700 ease-out group-hover:scale-105" style={{ transformOrigin: "200px 150px" }}>
        <ellipse cx={200} cy={150} rx={56} ry={72} strokeOpacity={0.35} strokeDasharray="2 5" />
        {[
          [178, 132], [222, 132], [200, 158], [186, 184], [214, 184], [200, 188], [166, 124], [234, 124], [160, 160], [240, 160], [174, 206], [226, 206], [200, 214],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.6} fill="currentColor" stroke="none" />
        ))}
        <path d="M178 132 200 158 222 132M186 184h28M166 124l12 8M234 124l-12 8M160 160l14 46 26 8 26-8 14-46" strokeOpacity={0.4} />
      </g>
    </g>
  ),

  // Vitals trace crossing an alert threshold.
  pulse: (
    <g>
      <path d="M40 110h320" strokeDasharray="4 6" strokeOpacity={0.45} />
      <path
        d="M40 190h60l12-30 14 50 16-80 14 60h40l10-20 12 30 14-110 14 110 12-20h82"
        strokeWidth={1.8}
        strokeLinejoin="round"
        className="transition-[stroke-dashoffset] duration-1000 ease-out"
        strokeDasharray="700"
        strokeDashoffset="0"
      />
      <circle cx={272} cy={110} r={7} fill="currentColor" fillOpacity={0.25} />
      <circle cx={272} cy={110} r={3} fill="currentColor" stroke="none" />
      <path d="M40 250h320" strokeOpacity={0.2} />
    </g>
  ),

  // Source -> staging -> warehouse pipeline.
  flow: (
    <g>
      {[
        [90, 150],
        [200, 150],
        [310, 150],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 38} y={y - 30} width={76} height={60} rx={8} fill={i === 1 ? "currentColor" : "none"} fillOpacity={0.1} />
          <path d={`M${x - 22} ${y - 8}h44M${x - 22} ${y + 6}h30`} strokeOpacity={0.5} />
        </g>
      ))}
      <path d="M128 150h34M238 150h34" strokeWidth={1.6} />
      <path d="M156 144l6 6-6 6M266 144l6 6-6 6" strokeWidth={1.6} />
      <g className="transition-transform duration-[1200ms] ease-in-out group-hover:translate-x-[220px]">
        <circle cx={90} cy={214} r={4} fill="currentColor" stroke="none" />
      </g>
      <path d="M90 214h220" strokeOpacity={0.25} strokeDasharray="3 5" />
      <path d="M200 70v20M190 80h20" strokeOpacity={0.4} />
    </g>
  ),
};
