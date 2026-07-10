import { BOARD_SIZE } from "../game/types";
import type { Board, CellStatus, Ship } from "../game/types";
import { shipCellInfoAt } from "../game/shipVisual";
import { ShipSegment } from "./ShipSegment";

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
              const key = `${row},${col}`;
              const isPreview = previewCells?.has(key);
              const shipInfo = shipCellInfoAt(ships, row, col);
              const showHull = Boolean(shipInfo && (revealShips || shipInfo.sunk));
              const classes = [
                "cell",
                status,
                interactive ? "interactive" : "",
                showHull ? "has-ship" : "",
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
                  {showHull && shipInfo && (
                    <ShipSegment
                      kind={shipInfo.ship.kind}
                      part={shipInfo.part}
                      orientation={shipInfo.orientation}
                      sunk={shipInfo.sunk}
                      sinking={shipInfo.ship.name === sinkingShipName}
                    />
                  )}
                  {shipInfo?.ship.name === sinkingShipName && (
                    <>
                      <span className="ripple" aria-hidden="true" />
                      <span className="water-rise" aria-hidden="true" />
                      <span className="bubbles" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    </>
                  )}
                  {status === "hit" && <span className="marker hit">✹</span>}
                  {status === "miss" && <span className="marker miss">•</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
