import { useMemo, useRef, useState } from "react";
import { BoardGrid } from "./components/BoardGrid";
import { AIPlayer } from "./game/ai";
import {
  allShipsSunk,
  canPlaceShip,
  createEmptyBoard,
  fireAt,
  placeShip,
  placeShipsRandomly,
  shipCellsFor,
} from "./game/board";
import { SHIP_SPECS } from "./game/types";
import type { Board, Orientation, Ship } from "./game/types";
import "./App.css";

type Phase = "setup" | "playing" | "gameover";

function App() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [playerBoard, setPlayerBoard] = useState<Board>(() => createEmptyBoard());
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [computerBoard, setComputerBoard] = useState<Board>(() => createEmptyBoard());
  const [computerShips, setComputerShips] = useState<Ship[]>([]);
  const [shipIndex, setShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const [message, setMessage] = useState("Posicione seus navios no tabuleiro.");
  const [winner, setWinner] = useState<"player" | "computer" | null>(null);
  const [turn, setTurn] = useState<"player" | "computer">("player");
  const ai = useRef(new AIPlayer());

  const currentSpec = SHIP_SPECS[shipIndex];

  const previewCells = useMemo(() => {
    if (!hoverCell || !currentSpec) return undefined;
    const cells = shipCellsFor(hoverCell.row, hoverCell.col, currentSpec.size, orientation);
    return new Set(cells.map((c) => `${c.row},${c.col}`));
  }, [hoverCell, currentSpec, orientation]);

  const previewValid = useMemo(() => {
    if (!hoverCell || !currentSpec) return false;
    return canPlaceShip(playerBoard, hoverCell.row, hoverCell.col, currentSpec.size, orientation);
  }, [hoverCell, currentSpec, orientation, playerBoard]);

  function handlePlaceShip(row: number, col: number) {
    if (!currentSpec) return;
    if (!canPlaceShip(playerBoard, row, col, currentSpec.size, orientation)) return;

    const board = playerBoard.map((r) => r.map((c) => ({ ...c })));
    const ship = placeShip(board, currentSpec, row, col, orientation);
    setPlayerBoard(board);
    setPlayerShips((prev) => [...prev, ship]);

    if (shipIndex + 1 < SHIP_SPECS.length) {
      setShipIndex(shipIndex + 1);
    } else {
      setMessage("Todos os navios posicionados. Pronto para batalha!");
    }
  }

  function handleRandomize() {
    const board = createEmptyBoard();
    const ships = placeShipsRandomly(board);
    setPlayerBoard(board);
    setPlayerShips(ships);
    setShipIndex(SHIP_SPECS.length);
    setMessage("Navios posicionados aleatoriamente. Pronto para batalha!");
  }

  function handleReset() {
    setPlayerBoard(createEmptyBoard());
    setPlayerShips([]);
    setShipIndex(0);
    setMessage("Posicione seus navios no tabuleiro.");
  }

  function startBattle() {
    const board = createEmptyBoard();
    const ships = placeShipsRandomly(board);
    setComputerBoard(board);
    setComputerShips(ships);
    ai.current = new AIPlayer();
    setPhase("playing");
    setTurn("player");
    setMessage("Sua vez! Atire no tabuleiro do computador.");
  }

  function handlePlayerFire(row: number, col: number) {
    if (turn !== "player" || phase !== "playing") return;

    const board = computerBoard.map((r) => r.map((c) => ({ ...c })));
    const ships = computerShips.map((s) => ({ ...s, hits: new Set(s.hits) }));
    const result = fireAt(board, ships, row, col);
    if (result === "already-shot") return;

    setComputerBoard(board);
    setComputerShips(ships);

    if (allShipsSunk(ships)) {
      setWinner("player");
      setPhase("gameover");
      setMessage("Você afundou toda a frota inimiga! Vitória!");
      return;
    }

    if (result === "hit") setMessage("Acertou! Jogue de novo... aguarde a resposta do computador.");
    else if (result === "sunk") setMessage("Navio inimigo afundado!");
    else setMessage("Água! Vez do computador.");

    setTurn("computer");
    window.setTimeout(() => computerTurn(), 600);
  }

  function computerTurn() {
    const board = playerBoard.map((r) => r.map((c) => ({ ...c })));
    const ships = playerShips.map((s) => ({ ...s, hits: new Set(s.hits) }));
    const { row, col, result } = ai.current.fire(board, ships);
    const cellLabel = `${"ABCDEFGHIJ"[col]}${row + 1}`;

    setPlayerBoard(board);
    setPlayerShips(ships);
    setTurn("player");

    if (allShipsSunk(ships)) {
      setWinner("computer");
      setPhase("gameover");
      setMessage(`O computador atirou em ${cellLabel} e afundou sua frota. Derrota!`);
    } else if (result === "sunk") {
      setMessage(`O computador afundou seu navio em ${cellLabel}! Sua vez.`);
    } else if (result === "hit") {
      setMessage(`O computador acertou em ${cellLabel}. Sua vez.`);
    } else {
      setMessage(`O computador errou em ${cellLabel}. Sua vez!`);
    }
  }

  function handlePlayAgain() {
    setPhase("setup");
    setPlayerBoard(createEmptyBoard());
    setPlayerShips([]);
    setComputerBoard(createEmptyBoard());
    setComputerShips([]);
    setShipIndex(0);
    setOrientation("horizontal");
    setWinner(null);
    setTurn("player");
    setMessage("Posicione seus navios no tabuleiro.");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚓ Batalha Naval</h1>
        <p className="message">{message}</p>
      </header>

      {phase === "setup" && (
        <section className="setup">
          <div className="setup-controls">
            {shipIndex < SHIP_SPECS.length ? (
              <p>
                Posicionando: <strong>{currentSpec.name}</strong> ({currentSpec.size} células)
              </p>
            ) : (
              <p>Frota completa!</p>
            )}
            <button
              type="button"
              onClick={() => setOrientation((o) => (o === "horizontal" ? "vertical" : "horizontal"))}
            >
              Orientação: {orientation === "horizontal" ? "Horizontal" : "Vertical"}
            </button>
            <button type="button" onClick={handleRandomize}>
              Posicionar aleatoriamente
            </button>
            <button type="button" onClick={handleReset}>
              Reiniciar posicionamento
            </button>
            <button type="button" className="primary" disabled={shipIndex < SHIP_SPECS.length} onClick={startBattle}>
              Iniciar Batalha
            </button>
          </div>
          <BoardGrid
            board={playerBoard}
            revealShips
            interactive={shipIndex < SHIP_SPECS.length}
            onCellClick={handlePlaceShip}
            onCellHover={(row, col) => setHoverCell({ row, col })}
            previewCells={shipIndex < SHIP_SPECS.length ? previewCells : undefined}
            previewValid={previewValid}
          />
        </section>
      )}

      {phase !== "setup" && (
        <section className="battle">
          <div className="board-column">
            <h2>Seu tabuleiro</h2>
            <BoardGrid board={playerBoard} revealShips interactive={false} />
          </div>
          <div className="board-column">
            <h2>Tabuleiro inimigo</h2>
            <BoardGrid
              board={computerBoard}
              revealShips={phase === "gameover"}
              interactive={phase === "playing" && turn === "player"}
              onCellClick={handlePlayerFire}
            />
          </div>
        </section>
      )}

      {phase === "gameover" && (
        <div className="gameover-banner">
          <h2>{winner === "player" ? "🎉 Você venceu!" : "💥 O computador venceu!"}</h2>
          <button type="button" className="primary" onClick={handlePlayAgain}>
            Jogar novamente
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
