import { useId } from "react";
import type { Orientation, ShipKind } from "../game/types";
import type { ShipPart } from "../game/shipVisual";

interface ShipSegmentProps {
  kind: ShipKind;
  part: ShipPart;
  orientation: Orientation;
  sunk: boolean;
  sinking?: boolean;
}

const HULL_PATH: Record<ShipPart, string> = {
  front: "M9,5 L31,5 L31,27 L9,27 L1,16 Z",
  mid: "M1,5 L31,5 L31,27 L1,27 Z",
  back: "M1,5 L27,5 L31,10 L31,22 L27,27 L1,27 Z",
};

function KindDetails({ kind, part }: { kind: ShipKind; part: ShipPart }) {
  switch (kind) {
    case "carrier":
      return (
        <>
          <line x1="4" y1="16" x2="28" y2="16" stroke="#f4c430" strokeWidth="1.2" strokeDasharray="3 2" />
          {part === "mid" && <rect x="12" y="8" width="6" height="4" rx="1" fill="#3a4048" />}
        </>
      );
    case "battleship":
      return (
        <>
          <circle cx={part === "front" ? 20 : 16} cy="16" r="4" fill="#3a4048" stroke="#1c1f24" strokeWidth="0.6" />
          <circle cx={part === "front" ? 20 : 16} cy="16" r="1.4" fill="#1c1f24" />
        </>
      );
    case "cruiser":
      return (
        <>
          <line x1="3" y1="10" x2="29" y2="10" stroke="#1c1f24" strokeWidth="0.8" opacity="0.35" />
          <line x1="3" y1="22" x2="29" y2="22" stroke="#1c1f24" strokeWidth="0.8" opacity="0.35" />
        </>
      );
    case "submarine":
      return part === "mid" ? (
        <rect x="13" y="4" width="6" height="8" rx="1.5" fill="#232a33" stroke="#12161c" strokeWidth="0.6" />
      ) : null;
    case "destroyer":
      return part === "front" ? (
        <line x1="24" y1="2" x2="24" y2="9" stroke="#1c1f24" strokeWidth="1" />
      ) : null;
    default:
      return null;
  }
}

const HULL_COLORS: Record<ShipKind, [string, string]> = {
  carrier: ["#8a94a3", "#5c6472"],
  battleship: ["#7d8794", "#4f5762"],
  cruiser: ["#7590a8", "#4a6178"],
  submarine: ["#4c5866", "#2c343c"],
  destroyer: ["#909aa6", "#666f7a"],
};

export function ShipSegment({ kind, part, orientation, sunk, sinking }: ShipSegmentProps) {
  const gradientId = useId();
  const [light, dark] = HULL_COLORS[kind];

  return (
    <span
      className="ship-orient"
      style={{ transform: orientation === "vertical" ? "rotate(90deg)" : undefined }}
    >
      <svg
        viewBox="0 0 32 32"
        className={`ship-segment${sunk ? " sunk" : ""}${sinking ? " sinking" : ""}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
        </defs>
        <path d={HULL_PATH[part]} fill={`url(#${gradientId})`} stroke="#1c1f24" strokeWidth="1" />
        <KindDetails kind={kind} part={part} />
      </svg>
    </span>
  );
}
