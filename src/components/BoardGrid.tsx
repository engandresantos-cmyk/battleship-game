import { BOARD_SIZE, cellKey, isSunk } from "../game/types";
import type { Board, CellStatus, Ship } from "../game/types";
import { shipBoundsFor } from "../game/shipVisual";
import { ShipOverlay } from "./ShipOverlay";

interface BoardGridProps {
  board: Board;
  ships: Ship[];
  revealShips: boolean;
  interactive: boolean;
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  previewCells?: Set<string>;
  previewValid?: boolean;
  sinkingShipName?: string | null;
}

function statusOf(board: Board, row: number, col: number): CellStatus {
  const cell = board[row][col];
  if (cell.shot) {
    return cell.shipName ? "hit" : "miss";
  }
  return "empty";
}

const COLS = "ABCDEFGHIJ".split("");

export function BoardGrid({
  board,
  ships,
  revealShips,
  interactive,
  onCellClick,
  onCellHover,
  previewCells,
  previewValid,
  sinkingShipName,
}: BoardGridProps) {
  const visibleShipCells = new Set<string>();
  for (const ship of ships) {
    if (revealShips || isSunk(ship)) {
      for (const key of ship.cells) visibleShipCells.add(key);
    }
  }

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
              const status = statusOf(board, row, col);
              const key = cellKey(row, col);
              const isPreview = previewCells?.has(key);
              const classes = [
                "cell",
                status,
                interactive ? "interactive" : "",
                visibleShipCells.has(key) ? "has-ship" : "",
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
                  {status === "hit" && <span className="marker hit">✹</span>}
                  {status === "miss" && <span className="marker miss">✕</span>}
                </button>
              );
            })}
          </div>
        ))}
        <div className="ship-layer">
          {ships
            .filter((ship) => revealShips || isSunk(ship))
            .map((ship) => (
              <ShipOverlay key={ship.name} {...shipBoundsFor(ship)} sinking={ship.name === sinkingShipName} />
            ))}
        </div>
      </div>
    </div>
  );
}
