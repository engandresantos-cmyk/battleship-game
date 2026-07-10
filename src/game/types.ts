export const BOARD_SIZE = 10;

export type Orientation = "horizontal" | "vertical";

export interface ShipSpec {
  name: string;
  size: number;
}

export const SHIP_SPECS: ShipSpec[] = [
  { name: "Porta-aviões", size: 5 },
  { name: "Encouraçado", size: 4 },
  { name: "Cruzador", size: 3 },
  { name: "Submarino", size: 3 },
  { name: "Destróier", size: 2 },
];

export interface Ship {
  name: string;
  size: number;
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
