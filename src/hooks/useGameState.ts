/**
 * Game state and input handling for the Candy Crush game.
 * Manages board, score, moves, selection, and animation state (matches, gravity, swap).
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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

/** Delay (ms) before showing swap result and running match detection */
const SWAP_ANIMATION_MS = 300;
/** Delay (ms) for reverse-swap (invalid move) animation */
const REVERSE_SWAP_ANIMATION_MS = 200;
/** Short delay (ms) before applying reverse-swap so React can apply animation classes */
const REVERSE_SWAP_PREP_MS = 10;
/** Delay (ms) between gravity and fill steps, and before next processMatches */
const CASCADE_STEP_MS = 300;

export function useGameState() {
  const [board, setBoard] = useState<(Candy | null)[][]>(() => initializeBoard());
  const [selectedCandy, setSelectedCandy] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchedPositions, setMatchedPositions] = useState<Position[]>([]);
  const [fallingPositions, setFallingPositions] = useState<Position[]>([]);
  const [lastSwap, setLastSwap] = useState<{ first: Position; second: Position } | null>(null);

  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutIds.current = timeoutIds.current.filter(x => x !== id);
      fn();
    }, ms);
    timeoutIds.current.push(id);
  }, []);

  /**
   * Finds matches on the current board, removes them, applies gravity, fills gaps,
   * then recurs until no matches remain. Updates score and animation state.
   * Returns true if any match was processed, false otherwise (used to detect invalid swap).
   */
  const processMatches = useCallback((currentBoard: (Candy | null)[][]) => {
    const matches = findAllMatches(currentBoard);

    if (matches.length === 0) {
      setIsAnimating(false);
      return false;
    }

    setMatchedPositions(matches);
    setScore(prev => prev + matches.length * 10);

    let newBoard = removeMatches(currentBoard, matches);

    scheduleTimeout(() => {
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

      scheduleTimeout(() => {
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

        scheduleTimeout(() => {
          setFallingPositions([]);
          processMatches(newBoard);
        }, CASCADE_STEP_MS);
      }, CASCADE_STEP_MS);
    }, CASCADE_STEP_MS);

    return true;
  }, [scheduleTimeout]);

  /**
   * Handles a cell click: either selects the cell or, if adjacent to the current selection, performs a swap.
   * Invalid swaps are reverted after a short delay with reverse animation.
   */
  const handleCandyClick = useCallback(
    (row: number, col: number) => {
      if (isAnimating) return;

      const clickedPosition = { row, col };

      if (!selectedCandy) {
        setSelectedCandy(clickedPosition);
        return;
      }

      if (selectedCandy.row === row && selectedCandy.col === col) {
        setSelectedCandy(null);
        return;
      }

      if (!areAdjacent(selectedCandy, clickedPosition)) {
        setSelectedCandy(clickedPosition);
        return;
      }

      setIsAnimating(true);
      setMoves(prev => prev + 1);
      setLastSwap({ first: selectedCandy, second: clickedPosition });
      let newBoard = swapCandies(board, selectedCandy, clickedPosition);
      setBoard(newBoard);
      setSelectedCandy(null);

      scheduleTimeout(() => {
        const hasMatchesAfterSwap = processMatches(newBoard);

        if (!hasMatchesAfterSwap) {
          setLastSwap(null);
          scheduleTimeout(() => {
            setLastSwap({ first: clickedPosition, second: selectedCandy });
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                newBoard = swapCandies(newBoard, selectedCandy, clickedPosition);
                setBoard(newBoard);
                scheduleTimeout(() => {
                  setIsAnimating(false);
                  setLastSwap(null);
                }, REVERSE_SWAP_ANIMATION_MS);
              });
            });
          }, REVERSE_SWAP_PREP_MS);
        } else {
          setLastSwap(null);
        }
      }, SWAP_ANIMATION_MS);
    },
    [selectedCandy, board, isAnimating, processMatches, scheduleTimeout]
  );

  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setScore(0);
    setMoves(0);
    setSelectedCandy(null);
    setIsAnimating(false);
    setMatchedPositions([]);
    setFallingPositions([]);
    setLastSwap(null);
  }, []);

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  );
}
