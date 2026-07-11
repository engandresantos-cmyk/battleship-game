import { BOARD_SIZE, cellKey, isSunk } from "./types";
import type { Board, Difficulty, Orientation, Ship } from "./types";
import { fireAt, shipCellsFor } from "./board";
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

function unshotCells(board: Board): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!board[row][col].shot) cells.push({ row, col });
    }
  }
  return cells;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Cells hit by our own previous shots whose ship isn't sunk yet. */
function unresolvedHits(board: Board, ships: Ship[]): { row: number; col: number }[] {
  const hits: { row: number; col: number }[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      if (cell.shot && cell.shipName) {
        const ship = ships.find((s) => s.name === cell.shipName)!;
        if (!isSunk(ship)) hits.push({ row, col });
      }
    }
  }
  return hits;
}

/**
 * Probability-density map: for every remaining ship, count how many of its
 * possible placements would cover each cell (skipping cells already known to
 * be misses), weighted heavily toward cells covering an unresolved hit so the
 * AI finishes off a wounded ship first.
 */
function computeProbabilityBoard(board: Board, ships: Ship[]): number[][] {
  const scores: number[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0)
  );
  const noGo = new Set<string>();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      if (cell.shot && !cell.shipName) noGo.add(cellKey(row, col));
    }
  }

  const hits = new Set(unresolvedHits(board, ships).map(({ row, col }) => cellKey(row, col)));
  const remaining = ships.filter((s) => !isSunk(s));

  for (const ship of remaining) {
    for (const orientation of ["horizontal", "vertical"] as Orientation[]) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const cells = shipCellsFor(row, col, ship.size, orientation);
          let valid = true;
          let touchesHit = false;
          for (const { row: r, col: c } of cells) {
            if (!inBounds(r, c) || noGo.has(cellKey(r, c))) {
              valid = false;
              break;
            }
            if (hits.has(cellKey(r, c))) touchesHit = true;
          }
          if (!valid) continue;
          const weight = touchesHit ? 8 : 1;
          for (const { row: r, col: c } of cells) {
            scores[r][c] += weight;
          }
        }
      }
    }
  }

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].shot) scores[row][col] = 0;
    }
  }
  return scores;
}

function highestScoreCell(scores: number[][]): { row: number; col: number } {
  let best: { row: number; col: number }[] = [];
  let bestScore = -1;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (scores[row][col] > bestScore) {
        bestScore = scores[row][col];
        best = [{ row, col }];
      } else if (scores[row][col] === bestScore) {
        best.push({ row, col });
      }
    }
  }
  return pickRandom(best);
}

/** Shared "hunt a wounded ship along a line" targeting used by hard/master as a fallback. */
function targetAroundHits(board: Board, hits: { row: number; col: number }[]): { row: number; col: number } | null {
  if (hits.length >= 2) {
    const [a, b] = hits;
    const sameRow = a.row === b.row;
    const sameCol = a.col === b.col;
    if (sameRow || sameCol) {
      const sorted = [...hits].sort((x, y) => (sameRow ? x.col - y.col : x.row - y.row));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const candidates = sameRow
        ? [
            { row: first.row, col: first.col - 1 },
            { row: last.row, col: last.col + 1 },
          ]
        : [
            { row: first.row - 1, col: first.col },
            { row: last.row + 1, col: last.col },
          ];
      const valid = candidates.filter((c) => inBounds(c.row, c.col) && !board[c.row][c.col].shot);
      if (valid.length > 0) return pickRandom(valid);
    }
  }
  const neighbors: { row: number; col: number }[] = [];
  for (const hit of hits) {
    for (const { dr, dc } of DIRECTIONS) {
      const r = hit.row + dr;
      const c = hit.col + dc;
      if (inBounds(r, c) && !board[r][c].shot) neighbors.push({ row: r, col: c });
    }
  }
  return neighbors.length > 0 ? pickRandom(neighbors) : null;
}

/**
 * Computer opponent with four difficulty tiers:
 * - easy: fires at uniformly random cells, never follows up on hits.
 * - medium: random hunting, then probes the four neighbors of a hit.
 * - hard: checkerboard-parity hunting plus line-following once a ship is wounded.
 * - master: full probability-density targeting, recomputed after every shot.
 */
export class AIPlayer {
  private difficulty: Difficulty;
  private targetQueue: { row: number; col: number }[] = [];

  constructor(difficulty: Difficulty = "medium") {
    this.difficulty = difficulty;
  }

  private chooseShot(board: Board, ships: Ship[]): { row: number; col: number } {
    const open = unshotCells(board);

    if (this.difficulty === "easy") {
      return pickRandom(open);
    }

    if (this.difficulty === "medium") {
      while (this.targetQueue.length > 0) {
        const next = this.targetQueue.shift()!;
        if (!board[next.row][next.col].shot) return next;
      }
      return pickRandom(open);
    }

    const hits = unresolvedHits(board, ships);

    if (this.difficulty === "hard") {
      if (hits.length > 0) {
        const target = targetAroundHits(board, hits);
        if (target) return target;
      }
      const parityCells = open.filter(({ row, col }) => (row + col) % 2 === 0);
      return pickRandom(parityCells.length > 0 ? parityCells : open);
    }

    // master
    const scores = computeProbabilityBoard(board, ships);
    return highestScoreCell(scores);
  }

  fire(board: Board, ships: Ship[]): { row: number; col: number; result: FireResult } {
    const { row, col } = this.chooseShot(board, ships);
    const result = fireAt(board, ships, row, col);

    if (this.difficulty === "medium") {
      if (result === "hit") {
        for (const { dr, dc } of DIRECTIONS) {
          const r = row + dr;
          const c = col + dc;
          if (inBounds(r, c) && !board[r][c].shot) {
            this.targetQueue.push({ row: r, col: c });
          }
        }
      } else if (result === "sunk") {
        this.targetQueue = [];
      }
    }

    return { row, col, result };
  }
}
