export const BOARD_SIZE = 10;

export type Orientation = "horizontal" | "vertical";

export type ShipKind = "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";

export type Difficulty = "easy" | "medium" | "hard" | "master";

export interface ShipSpec {
  name: string;
  size: number;
  kind: ShipKind;
}

export const SHIP_SPECS: ShipSpec[] = [
  { name: "Porta-aviões", size: 5, kind: "carrier" },
  { name: "Encouraçado", size: 4, kind: "battleship" },
  { name: "Cruzador", size: 3, kind: "cruiser" },
  { name: "Submarino", size: 3, kind: "submarine" },
  { name: "Destróier", size: 2, kind: "destroyer" },
];

export interface Ship {
  name: string;
  size: number;
  kind: ShipKind;
  cells: string[];
  hits: Set<string>;
}

export interface Cell {
  shot: boolean;
  shipName: string | null;
}

export type Board = Cell[][];

export type CellStatus = "empty" | "ship" | "hit" | "miss" | "sunk";

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function isSunk(ship: Ship): boolean {
  return ship.hits.size >= ship.size;
}
