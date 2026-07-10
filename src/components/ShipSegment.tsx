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
  front: "M11,4 L31,4 L31,28 L11,28 L0,16 Z",
  mid: "M1,4 L31,4 L31,28 L1,28 Z",
  back: "M1,4 L27,4 Q31,4 31,9 L31,23 Q31,28 27,28 L1,28 Z",
};

function Turret({ x, facing, sheenId }: { x: number; facing: 1 | -1; sheenId: string }) {
  return (
    <g>
      <ellipse cx={x} cy="17.5" rx="3.4" ry="2" fill="#000" opacity="0.25" />
      <circle cx={x} cy="16" r="3.6" fill="#4a5058" stroke="#1c1f24" strokeWidth="0.6" />
      <circle cx={x} cy="16" r="3.6" fill={`url(#${sheenId})`} />
      <rect x={facing === -1 ? x - 1.6 : x - 0.6} y="14.4" width="6" height="1.1" rx="0.5" fill="#22262b" />
      <rect x={facing === -1 ? x - 1.6 : x - 0.6} y="16.5" width="6" height="1.1" rx="0.5" fill="#22262b" />
    </g>
  );
}

function KindDetails({
  kind,
  part,
  turretSheenId,
}: {
  kind: ShipKind;
  part: ShipPart;
  turretSheenId: string;
}) {
  switch (kind) {
    case "carrier":
      return (
        <>
          <rect x="2" y="6" width="28" height="20" rx="1.5" fill="#cbb989" opacity="0.9" />
          <line x1="4" y1="16" x2="28" y2="16" stroke="#f4c430" strokeWidth="1.1" strokeDasharray="2.5 2" />
          <line x1="8" y1="9" x2="8" y2="12" stroke="#f4c430" strokeWidth="1" opacity="0.8" />
          <line x1="22" y1="20" x2="22" y2="23" stroke="#f4c430" strokeWidth="1" opacity="0.8" />
          {part === "mid" && (
            <>
              <rect x="20" y="5" width="5" height="12" rx="1" fill="#565d66" stroke="#1c1f24" strokeWidth="0.5" />
              <line x1="22.5" y1="2" x2="22.5" y2="5" stroke="#1c1f24" strokeWidth="0.8" />
              <circle cx="22.5" cy="2" r="0.8" fill="#1c1f24" />
            </>
          )}
        </>
      );
    case "battleship":
      return (
        <>
          {part === "front" && <Turret x={21} facing={-1} sheenId={turretSheenId} />}
          {part === "back" && <Turret x={11} facing={1} sheenId={turretSheenId} />}
          {part === "mid" && (
            <>
              <rect x="12" y="7" width="8" height="10" rx="1" fill="#565d66" stroke="#1c1f24" strokeWidth="0.5" />
              <line x1="16" y1="3" x2="16" y2="7" stroke="#1c1f24" strokeWidth="0.9" />
              <circle cx="16" cy="16" r="0" />
            </>
          )}
          <line x1="2" y1="6" x2="30" y2="6" stroke="#fff" strokeWidth="0.6" opacity="0.25" />
        </>
      );
    case "cruiser":
      return (
        <>
          {part === "front" && <Turret x={22} facing={-1} sheenId={turretSheenId} />}
          {part === "back" && <Turret x={10} facing={1} sheenId={turretSheenId} />}
          {part === "mid" && (
            <>
              <line x1="16" y1="4" x2="16" y2="10" stroke="#1c1f24" strokeWidth="0.9" />
              <circle cx="16" cy="4" r="1" fill="#1c1f24" />
            </>
          )}
          <line x1="3" y1="9" x2="29" y2="9" stroke="#1c1f24" strokeWidth="0.7" opacity="0.3" />
          <line x1="3" y1="23" x2="29" y2="23" stroke="#1c1f24" strokeWidth="0.7" opacity="0.3" />
        </>
      );
    case "submarine":
      return (
        <>
          {part === "mid" && (
            <>
              <rect x="12" y="1" width="8" height="11" rx="2" fill="#232a33" stroke="#12161c" strokeWidth="0.6" />
              <line x1="16" y1="-2" x2="16" y2="1" stroke="#12161c" strokeWidth="0.9" />
            </>
          )}
          <line x1="2" y1="8" x2="30" y2="8" stroke="#0d1116" strokeWidth="0.8" opacity="0.4" />
          <line x1="2" y1="24" x2="30" y2="24" stroke="#0d1116" strokeWidth="0.8" opacity="0.4" />
        </>
      );
    case "destroyer":
      return (
        <>
          {part === "front" && <Turret x={20} facing={-1} sheenId={turretSheenId} />}
          {part === "back" && (
            <>
              <line x1="12" y1="3" x2="12" y2="9" stroke="#1c1f24" strokeWidth="0.9" />
              <circle cx="12" cy="3" r="1.1" fill="#1c1f24" />
            </>
          )}
        </>
      );
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
  const sheenId = useId();
  const turretSheenId = useId();
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
            <stop offset="0.5" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
          <radialGradient id={sheenId} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={turretSheenId} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path d={HULL_PATH[part]} fill={`url(#${gradientId})`} stroke="#1c1f24" strokeWidth="1" />
        <path d={HULL_PATH[part]} fill={`url(#${sheenId})`} />

        {part === "front" && (
          <>
            <path d="M0,16 Q7,9 15,7" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.3" />
            <path d="M0,16 Q7,23 15,25" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.3" />
          </>
        )}

        <line x1="1.5" y1="5" x2="30.5" y2="5" stroke="#1c1f24" strokeWidth="0.6" opacity="0.2" />
        <line x1="1.5" y1="27" x2="30.5" y2="27" stroke="#1c1f24" strokeWidth="0.6" opacity="0.2" />

        <KindDetails kind={kind} part={part} turretSheenId={turretSheenId} />
      </svg>
    </span>
  );
}
