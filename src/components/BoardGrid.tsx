import { BOARD_SIZE } from "../game/types";
import type { Board, CellStatus } from "../game/types";

interface BoardGridProps {
  board: Board;
  revealShips: boolean;
  interactive: boolean;
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  previewCells?: Set<string>;
  previewValid?: boolean;
}

function statusOf(board: Board, row: number, col: number, revealShips: boolean): CellStatus {
  const cell = board[row][col];
  if (cell.shot) {
    return cell.shipName ? "hit" : "miss";
  }
  if (cell.shipName && revealShips) return "ship";
  return "empty";
}

const COLS = "ABCDEFGHIJ".split("");

export function BoardGrid({
  board,
  revealShips,
  interactive,
  onCellClick,
  onCellHover,
  previewCells,
  previewValid,
}: BoardGridProps) {
  return (
    <div className="board-wrapper">
      <div className="board-grid" role="grid">
        <div className="corner" />
        {COLS.map((c) => (
          <div className="col-label" key={c}>
            {c}
          </div>
        ))}
        {Array.from({ length: BOARD_SIZE }, (_, row) => (
          <div className="board-row" key={row} role="row">
            <div className="row-label">{row + 1}</div>
            {Array.from({ length: BOARD_SIZE }, (_, col) => {
              const status = statusOf(board, row, col, revealShips);
              const key = `${row},${col}`;
              const isPreview = previewCells?.has(key);
              const classes = [
                "cell",
                status,
                interactive ? "interactive" : "",
                isPreview ? (previewValid ? "preview-valid" : "preview-invalid") : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  type="button"
                  key={key}
                  className={classes}
                  disabled={!interactive || board[row][col].shot}
                  onClick={() => onCellClick?.(row, col)}
                  onMouseEnter={() => onCellHover?.(row, col)}
                  aria-label={`${COLS[col]}${row + 1}`}
                >
                  {status === "hit" && "✹"}
                  {status === "miss" && "•"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
