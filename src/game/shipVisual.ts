import { cellKey, isSunk } from "./types";
import type { Orientation, Ship } from "./types";

export type ShipPart = "front" | "mid" | "back";

export interface ShipCellInfo {
  ship: Ship;
  orientation: Orientation;
  part: ShipPart;
  sunk: boolean;
}

export function shipCellInfoAt(ships: Ship[], row: number, col: number): ShipCellInfo | null {
  const key = cellKey(row, col);
  for (const ship of ships) {
    const index = ship.cells.indexOf(key);
    if (index === -1) continue;

    const [r0, c0] = ship.cells[0].split(",").map(Number);
    const [r1, c1] = ship.cells[Math.min(1, ship.cells.length - 1)].split(",").map(Number);
    const orientation: Orientation = r0 === r1 && c0 !== c1 ? "horizontal" : "vertical";
    const part: ShipPart =
      index === 0 ? "front" : index === ship.cells.length - 1 ? "back" : "mid";

    return { ship, orientation, part, sunk: isSunk(ship) };
  }
  return null;
}
