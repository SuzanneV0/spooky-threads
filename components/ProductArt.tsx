import { colorwayFor, productMotifs, type Motif } from "@/lib/productArt";

function Garment({ type, fg }: { type: string; fg: string }) {
  switch (type) {
    case "sweater":
      return (
        <path
          d="M70 60 L70 40 L85 30 Q100 40 115 30 L130 40 L130 60 L155 75 L145 100 L130 92 L130 165 Q100 172 70 165 L70 92 L55 100 L45 75 Z"
          fill={fg}
        />
      );
    case "shirt":
      return (
        <path
          d="M75 45 L88 32 L100 40 L112 32 L125 45 L150 62 L138 85 L125 78 L125 165 Q100 172 75 165 L75 78 L62 85 L50 62 Z"
          fill={fg}
        />
      );
    case "hat":
      return (
        <g fill={fg}>
          <path d="M60 110 Q60 55 100 55 Q140 55 140 110 Z" />
          <rect x="55" y="108" width="90" height="18" rx="9" />
        </g>
      );
    case "mug":
      return (
        <g fill="none" stroke={fg} strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
          <rect x="55" y="65" width="75" height="80" rx="8" fill={fg} stroke="none" />
          <path d="M130 85 Q160 85 160 105 Q160 125 130 125" />
        </g>
      );
    case "tumbler":
      return (
        <g fill={fg}>
          <path d="M72 55 L128 55 L120 155 Q100 165 80 155 Z" />
          <ellipse cx="100" cy="52" rx="30" ry="9" />
        </g>
      );
    case "blanket":
      return (
        <g fill={fg}>
          <rect x="45" y="70" width="110" height="70" rx="6" />
          <path d="M45 85 L155 85 M45 100 L155 100 M45 115 L155 115 M45 130 L155 130" stroke="#00000022" strokeWidth="3" fill="none" />
        </g>
      );
    default:
      return <circle cx="100" cy="100" r="40" fill={fg} />;
  }
}

function MotifBadge({ motif, accent, fg }: { motif: Motif; accent: string; fg: string }) {
  if (!motif) return null;
  const common = { cx: 152, cy: 48, r: 26 } as const;
  return (
    <g>
      <circle {...common} fill={accent} />
      <g transform={`translate(${common.cx - 14}, ${common.cy - 14})`} fill={fg}>
        {motif === "bat" && (
          <path d="M14 8 Q6 0 0 6 Q6 10 10 10 Q6 16 0 20 Q10 24 14 16 Q18 24 28 20 Q22 16 18 10 Q22 10 28 6 Q22 0 14 8 Z" />
        )}
        {motif === "pumpkin" && (
          <g>
            <rect x="12" y="0" width="4" height="6" />
            <ellipse cx="14" cy="16" rx="13" ry="11" />
          </g>
        )}
        {motif === "ghost" && (
          <path d="M14 2 Q26 2 26 16 L26 24 L21 19 L16 24 L11 19 L6 24 L2 19 L2 16 Q2 2 14 2 Z" />
        )}
        {motif === "cat" && (
          <path d="M4 6 L9 0 L11 8 Q14 6 17 8 L19 0 L24 6 Q26 14 24 20 Q14 26 4 20 Q2 14 4 6 Z" />
        )}
        {motif === "witch" && (
          <path d="M14 0 L22 18 Q14 15 2 20 Z M8 20 Q14 18 20 20 L20 23 Q14 21 8 23 Z" />
        )}
        {motif === "monster" && (
          <g>
            <circle cx="9" cy="12" r="6" fill="white" />
            <circle cx="19" cy="12" r="6" fill="white" />
            <circle cx="9" cy="12" r="2.5" />
            <circle cx="19" cy="12" r="2.5" />
          </g>
        )}
        {motif === "leaf" && (
          <path d="M14 26 Q0 20 4 4 Q20 0 24 14 Q22 26 14 26 Z M14 26 Q14 14 22 6" fill="none" stroke={fg} strokeWidth="2" />
        )}
        {motif === "moon" && <path d="M20 2 Q10 2 10 14 Q10 26 20 26 Q12 20 12 14 Q12 8 20 2 Z" />}
      </g>
    </g>
  );
}

export default function ProductArt({
  slug,
  productType,
  className,
}: {
  slug: string;
  productType: string;
  className?: string;
}) {
  const { bg, fg, accent } = colorwayFor(slug);
  const motif = productMotifs[slug] ?? null;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`${productType} illustration`}>
      <rect width="200" height="200" rx="16" fill={bg} />
      <Garment type={productType} fg={fg} />
      <MotifBadge motif={motif} accent={accent} fg={fg} />
    </svg>
  );
}
