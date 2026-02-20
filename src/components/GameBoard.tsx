import { Candy as CandyType, Position } from '../types/game';
import { Candy } from './Candy';
import { BOARD_SIZE } from '../constants/game';

interface GameBoardProps {
  board: (CandyType | null)[][];
  selectedCandy: Position | null;
  matchedPositions?: Position[];
  fallingPositions?: Position[];
  lastSwap?: { first: Position; second: Position } | null;
  onCandyClick: (row: number, col: number) => void;
}

export function GameBoard({
  board,
  selectedCandy,
  matchedPositions = [],
  fallingPositions = [],
  lastSwap,
  onCandyClick,
}: GameBoardProps) {
  const isMatched = (row: number, col: number) =>
    matchedPositions.some(pos => pos.row === row && pos.col === col);

  const isFalling = (row: number, col: number) =>
    fallingPositions.some(pos => pos.row === row && pos.col === col);

  const getSwapDirection = (row: number, col: number): 'from-left' | 'from-right' | 'from-top' | 'from-bottom' | undefined => {
    if (!lastSwap) return undefined;

    const { first, second } = lastSwap;

    if (row === first.row && col === first.col) {
      if (second.row === first.row) {
        if (second.col === first.col + 1) return 'from-right';
        if (second.col === first.col - 1) return 'from-left';
      } else if (second.col === first.col) {
        if (second.row === first.row + 1) return 'from-bottom';
        if (second.row === first.row - 1) return 'from-top';
      }
    }

    if (row === second.row && col === second.col) {
      if (first.row === second.row) {
        if (first.col === second.col + 1) return 'from-right';
        if (first.col === second.col - 1) return 'from-left';
      } else if (first.col === second.col) {
        if (first.row === second.row + 1) return 'from-bottom';
        if (first.row === second.row - 1) return 'from-top';
      }
    }

    return undefined;
  };

  return (
    <div
      className="inline-grid gap-2 p-6 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-2xl shadow-2xl"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((candy, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-16 h-16"
          >
            {candy && (
              <Candy
                color={candy.color}
                isSelected={
                  selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex
                }
                isMatched={isMatched(rowIndex, colIndex)}
                isFalling={isFalling(rowIndex, colIndex)}
                swapDirection={getSwapDirection(rowIndex, colIndex)}
                onClick={() => onCandyClick(rowIndex, colIndex)}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
