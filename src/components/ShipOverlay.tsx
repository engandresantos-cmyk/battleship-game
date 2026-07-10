import { shipImageSrc } from "../game/shipImages";
import type { ShipBounds } from "../game/shipVisual";

const CELL = 32;
const GAP = 3;
const PITCH = CELL + GAP;
const LABEL_COL_WIDTH = 24;
const LABEL_ROW_HEIGHT = 32;

interface ShipOverlayProps extends ShipBounds {
  sinking: boolean;
}

export function ShipOverlay({ ship, row, col, orientation, sunk, sinking }: ShipOverlayProps) {
  const left = LABEL_COL_WIDTH + GAP + col * PITCH;
  const top = LABEL_ROW_HEIGHT + GAP + row * PITCH;
  const span = ship.size * CELL + (ship.size - 1) * GAP;
  const width = orientation === "horizontal" ? span : CELL;
  const height = orientation === "horizontal" ? CELL : span;

  const centerStyle =
    orientation === "horizontal"
      ? { top: "50%", left: 0, width: "100%", transform: "translateY(-50%)" }
      : { left: "50%", top: 0, height: "100%", transform: "translateX(-50%)" };

  return (
    <div className="ship-box" style={{ left, top, width, height }} aria-hidden="true">
      <div className="ship-center" style={centerStyle}>
        <img
          src={shipImageSrc(ship.kind, orientation)}
          alt=""
          className={`ship-img${sunk ? " sunk" : ""}${sinking ? " sinking" : ""}`}
          style={orientation === "horizontal" ? { width: "100%" } : { height: "100%" }}
        />
      </div>
      {sinking && (
        <>
          <span className="ripple" />
          <span className="water-rise" />
          <span className="bubbles">
            <i />
            <i />
            <i />
          </span>
        </>
      )}
    </div>
  );
}
