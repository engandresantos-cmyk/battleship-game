import { shipImageSrc } from "../game/shipImages";
import type { ShipBounds } from "../game/shipVisual";

interface ShipOverlayProps extends ShipBounds {
  sinking: boolean;
}

export function ShipOverlay({ ship, row, col, orientation, sunk, sinking }: ShipOverlayProps) {
  // +2: grid column/row 1 is the label row/column, and grid lines are 1-indexed.
  const colStart = col + 2;
  const rowStart = row + 2;
  const gridColumn = orientation === "horizontal" ? `${colStart} / span ${ship.size}` : `${colStart} / span 1`;
  const gridRow = orientation === "horizontal" ? `${rowStart} / span 1` : `${rowStart} / span ${ship.size}`;

  const centerStyle =
    orientation === "horizontal"
      ? { top: "50%", left: 0, width: "100%", transform: "translateY(-50%)" }
      : { left: "50%", top: 0, height: "100%", transform: "translateX(-50%)" };

  return (
    <div className="ship-box" style={{ gridColumn, gridRow }} aria-hidden="true">
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
