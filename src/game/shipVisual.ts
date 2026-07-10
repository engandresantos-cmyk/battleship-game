import { isSunk } from "./types";
import type { Orientation, Ship } from "./types";

export interface ShipBounds {
  ship: Ship;
  row: number;
  col: number;
  orientation: Orientation;
  sunk: boolean;
}

export function shipBoundsFor(ship: Ship): ShipBounds {
  const [r0, c0] = ship.cells[0].split(",").map(Number);
  const [r1, c1] = ship.cells[Math.min(1, ship.cells.length - 1)].split(",").map(Number);
  const orientation: Orientation = r0 === r1 && c0 !== c1 ? "horizontal" : "vertical";
  return { ship, row: r0, col: c0, orientation, sunk: isSunk(ship) };
}
