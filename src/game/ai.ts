import { BOARD_SIZE } from "./types";
import type { Board, Ship } from "./types";
import { fireAt } from "./board";
import type { FireResult } from "./board";

const DIRECTIONS = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Hunt/target AI: fires randomly until it scores a hit, then queues up
 * neighboring cells to home in on the rest of that ship.
 */
export class AIPlayer {
  private targetQueue: { row: number; col: number }[] = [];
  private tried = new Set<string>();

  chooseShot(): { row: number; col: number } {
    while (this.targetQueue.length > 0) {
      const next = this.targetQueue.shift()!;
      const key = `${next.row},${next.col}`;
      if (!this.tried.has(key) && inBounds(next.row, next.col)) {
        return next;
      }
    }

    let row: number, col: number, key: string;
    do {
      row = Math.floor(Math.random() * BOARD_SIZE);
      col = Math.floor(Math.random() * BOARD_SIZE);
      key = `${row},${col}`;
    } while (this.tried.has(key));
    return { row, col };
  }

  fire(board: Board, ships: Ship[]): { row: number; col: number; result: FireResult } {
    const { row, col } = this.chooseShot();
    this.tried.add(`${row},${col}`);
    const result = fireAt(board, ships, row, col);

    if (result === "hit") {
      for (const { dr, dc } of DIRECTIONS) {
        const r = row + dr;
        const c = col + dc;
        if (inBounds(r, c) && !this.tried.has(`${r},${c}`)) {
          this.targetQueue.push({ row: r, col: c });
        }
      }
    } else if (result === "sunk") {
      this.targetQueue = [];
    }

    return { row, col, result };
  }
}
