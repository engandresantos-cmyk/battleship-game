import { BOARD_SIZE, cellKey, SHIP_SPECS } from "./types";
import type { Board, Cell, Orientation, Ship, ShipSpec } from "./types";

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, (): Cell => ({ shot: false, shipName: null }))
  );
}

export function shipCellsFor(
  row: number,
  col: number,
  size: number,
  orientation: Orientation
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < size; i++) {
    cells.push(
      orientation === "horizontal" ? { row, col: col + i } : { row: row + i, col }
    );
  }
  return cells;
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function canPlaceShip(
  board: Board,
  row: number,
  col: number,
  size: number,
  orientation: Orientation
): boolean {
  const cells = shipCellsFor(row, col, size, orientation);
  for (const { row: r, col: c } of cells) {
    if (!inBounds(r, c)) return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc].shipName) return false;
      }
    }
  }
  return true;
}

export function placeShip(
  board: Board,
  ship: ShipSpec,
  row: number,
  col: number,
  orientation: Orientation
): Ship {
  const cells = shipCellsFor(row, col, ship.size, orientation);
  for (const { row: r, col: c } of cells) {
    board[r][c].shipName = ship.name;
  }
  return {
    name: ship.name,
    size: ship.size,
    kind: ship.kind,
    cells: cells.map(({ row: r, col: c }) => cellKey(r, c)),
    hits: new Set(),
  };
}

export function placeShipsRandomly(board: Board): Ship[] {
  const ships: Ship[] = [];
  for (const spec of SHIP_SPECS) {
    let placed = false;
    while (!placed) {
      const orientation: Orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (canPlaceShip(board, row, col, spec.size, orientation)) {
        ships.push(placeShip(board, spec, row, col, orientation));
        placed = true;
      }
    }
  }
  return ships;
}

export type FireResult = "hit" | "miss" | "sunk" | "already-shot";

export function fireAt(
  board: Board,
  ships: Ship[],
  row: number,
  col: number
): FireResult {
  const cell = board[row][col];
  if (cell.shot) return "already-shot";
  cell.shot = true;
  if (!cell.shipName) return "miss";

  const ship = ships.find((s) => s.name === cell.shipName)!;
  ship.hits.add(cellKey(row, col));
  return ship.hits.size >= ship.size ? "sunk" : "hit";
}

export function allShipsSunk(ships: Ship[]): boolean {
  return ships.every((s) => s.hits.size >= s.size);
}
