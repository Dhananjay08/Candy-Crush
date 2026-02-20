/**
 * Renders the game grid and delegates each cell to Candy.
 * Uses memoization and stable callbacks so Candy only re-renders when its props change.
 */

import { memo, useCallback, useMemo } from 'react';
import { Candy as CandyType, Position } from '../types/game';
import { Candy, type SwapDirection } from './Candy';
import { BOARD_SIZE } from '../constants/game';

interface GameBoardProps {
  board: (CandyType | null)[][];
  selectedCandy: Position | null;
  matchedPositions?: Position[];
  fallingPositions?: Position[];
  lastSwap?: { first: Position; second: Position } | null;
  onCandyClick: (row: number, col: number) => void;
}

function positionKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

function GameBoardComponent({
  board,
  selectedCandy,
  matchedPositions = [],
  fallingPositions = [],
  lastSwap,
  onCandyClick,
}: GameBoardProps) {
  const matchedSet = useMemo(
    () => new Set(matchedPositions.map(positionKey)),
    [matchedPositions]
  );
  const fallingSet = useMemo(
    () => new Set(fallingPositions.map(positionKey)),
    [fallingPositions]
  );

  const isMatched = useCallback(
    (row: number, col: number) => matchedSet.has(`${row},${col}`),
    [matchedSet]
  );
  const isFalling = useCallback(
    (row: number, col: number) => fallingSet.has(`${row},${col}`),
    [fallingSet]
  );

  const getSwapDirection = useCallback(
    (row: number, col: number): SwapDirection | undefined => {
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
    },
    [lastSwap]
  );

  return (
    <div
      className="inline-grid gap-2 p-6 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-2xl shadow-2xl"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
      }}
      role="grid"
      aria-label="Game board"
    >
      {board.map((row, rowIndex) =>
        row.map((candy, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-16 h-16"
            role="gridcell"
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

export const GameBoard = memo(GameBoardComponent);
