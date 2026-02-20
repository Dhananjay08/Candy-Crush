import { useState, useCallback } from 'react';
import { Candy, Position } from '../types/game';
import {
  initializeBoard,
  areAdjacent,
  swapCandies,
  findAllMatches,
  removeMatches,
  applyGravity,
  fillEmptySpaces,
} from '../utils/gameLogic';

export function useGameState() {
  const [board, setBoard] = useState<(Candy | null)[][]>(() => initializeBoard());
  const [selectedCandy, setSelectedCandy] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchedPositions, setMatchedPositions] = useState<Position[]>([]);
  const [fallingPositions, setFallingPositions] = useState<Position[]>([]);
  const [lastSwap, setLastSwap] = useState<{ first: Position; second: Position } | null>(null);

  const processMatches = useCallback((currentBoard: (Candy | null)[][]) => {
    const matches = findAllMatches(currentBoard);

    if (matches.length > 0) {
      setMatchedPositions(matches);
      setScore(prev => prev + matches.length * 10);

      let newBoard = removeMatches(currentBoard, matches);

      setTimeout(() => {
        setMatchedPositions([]);
        const beforeGravity = newBoard;
        newBoard = applyGravity(newBoard);

        const gravityFalling: Position[] = [];
        for (let row = 0; row < beforeGravity.length; row++) {
          for (let col = 0; col < beforeGravity[row].length; col++) {
            const beforeCandy = beforeGravity[row][col];
            const afterCandy = newBoard[row][col];
            if (afterCandy && beforeCandy?.id !== afterCandy.id) {
              gravityFalling.push({ row, col });
            }
          }
        }

        setBoard(newBoard);
        setFallingPositions(gravityFalling);

        setTimeout(() => {
          const beforeFill = newBoard;
          newBoard = fillEmptySpaces(newBoard);

          const newlyFilled: Position[] = [];
          for (let row = 0; row < beforeFill.length; row++) {
            for (let col = 0; col < beforeFill[row].length; col++) {
              const beforeCandy = beforeFill[row][col];
              const afterCandy = newBoard[row][col];
              if (!beforeCandy && afterCandy) {
                newlyFilled.push({ row, col });
              }
            }
          }

          setBoard(newBoard);
          setFallingPositions(prev => [...prev, ...newlyFilled]);

          setTimeout(() => {
            setFallingPositions([]);
            processMatches(newBoard);
          }, 300);
        }, 300);
      }, 300);

      return true;
    } else {
      setIsAnimating(false);
      return false;
    }
  }, []);

  const handleCandyClick = useCallback(
    (row: number, col: number) => {
      if (isAnimating) return;

      const clickedPosition = { row, col };

      if (!selectedCandy) {
        setSelectedCandy(clickedPosition);
      } else {
        if (selectedCandy.row === row && selectedCandy.col === col) {
          setSelectedCandy(null);
          return;
        }

        if (areAdjacent(selectedCandy, clickedPosition)) {
          setIsAnimating(true);
          setMoves(prev => prev + 1);

          setLastSwap({ first: selectedCandy, second: clickedPosition });
          let newBoard = swapCandies(board, selectedCandy, clickedPosition);
          setBoard(newBoard);

          setTimeout(() => {
            const hasMatchesAfterSwap = processMatches(newBoard);

            if (!hasMatchesAfterSwap) {
              // Clear lastSwap first to reset animation state
              setLastSwap(null);
              
              // Then set it for reverse swap animation
              setTimeout(() => {
                setLastSwap({ first: clickedPosition, second: selectedCandy });
                
                // Wait a frame for React to process and apply animation classes
                requestAnimationFrame(() => {
                  newBoard = swapCandies(newBoard, selectedCandy, clickedPosition);
                  setBoard(newBoard);

                  // Wait for animation to complete (200ms) before clearing state
                  setTimeout(() => {
                    setIsAnimating(false);
                    setLastSwap(null);
                  }, 200);
                });
              }, 10);
            } else {
              setLastSwap(null);
            }
          }, 300);

          setSelectedCandy(null);
        } else {
          setSelectedCandy(clickedPosition);
        }
      }
    },
    [selectedCandy, board, isAnimating, processMatches]
  );

  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setScore(0);
    setMoves(0);
    setSelectedCandy(null);
    setIsAnimating(false);
    setMatchedPositions([]);
  }, []);

  return {
    board,
    selectedCandy,
    score,
    moves,
    isAnimating,
    matchedPositions,
    fallingPositions,
    lastSwap,
    handleCandyClick,
    resetGame,
  };
}
