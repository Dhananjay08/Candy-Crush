/**
 * Pure game logic for the Candy Crush match-3 game.
 * All functions are deterministic and avoid mutating inputs; boards are copied before updates.
 */

import { Candy, Position } from '../types/game';
import { BOARD_SIZE, CANDY_COLORS, MIN_MATCH_LENGTH } from '../constants/game';

/** Type for the game board: 2D grid of Candy or empty cell */
export type Board = (Candy | null)[][];

/**
 * Creates a new candy with a random color at the given position.
 * Uses a unique id for React keys and for detecting gravity/fill changes.
 */
export function createCandy(row: number, col: number): Candy {
  const color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
  return {
    id: `${row}-${col}-${Date.now()}-${Math.random()}`,
    color,
    row,
    col,
  };
}

/**
 * Returns a candy with the same color and id but updated row/col.
 * Used when applying gravity to keep board state immutable.
 */
function candyWithPosition(candy: Candy, row: number, col: number): Candy {
  return { ...candy, row, col };
}

/**
 * Builds an initial board with no pre-existing matches.
 * Fills the grid then repeatedly re-rolls candies until no matches exist.
 */
export function initializeBoard(): Board {
  const board: Board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = createCandy(row, col);
    }
  }

  while (hasMatches(board)) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        board[row][col] = createCandy(row, col);
      }
    }
  }

  return board;
}

/** Returns true if the board has at least one match of MIN_MATCH_LENGTH or more. */
export function hasMatches(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (checkMatch(board, row, col)) return true;
    }
  }
  return false;
}

/**
 * Returns true if the cell (row, col) is part of a horizontal or vertical
 * match of at least MIN_MATCH_LENGTH same-color candies.
 */
export function checkMatch(board: Board, row: number, col: number): boolean {
  const candy = board[row][col];
  if (!candy) return false;

  const horizontalCount = countLine(board, row, col, 0, 1) + countLine(board, row, col, 0, -1) - 1;
  const verticalCount = countLine(board, row, col, 1, 0) + countLine(board, row, col, -1, 0) - 1;

  return horizontalCount >= MIN_MATCH_LENGTH || verticalCount >= MIN_MATCH_LENGTH;
}

/**
 * Counts consecutive same-color candies from (row, col) in direction (dr, dc).
 * Includes the starting cell.
 */
function countLine(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number
): number {
  const candy = board[row][col];
  if (!candy) return 0;
  let count = 0;
  let r = row;
  let c = col;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c]?.color === candy.color) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

/**
 * Returns all board positions that belong to at least one match.
 * Each position appears once (Set used to handle overlapping horizontal/vertical matches).
 */
export function findAllMatches(board: Board): Position[] {
  const matchKeys = new Set<string>();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const candy = board[row][col];
      if (!candy) continue;

      // Horizontal run through (row, col)
      const left = col - countLine(board, row, col, 0, -1) + 1;
      const right = col + countLine(board, row, col, 0, 1) - 1;
      if (right - left + 1 >= MIN_MATCH_LENGTH) {
        for (let c = left; c <= right; c++) matchKeys.add(`${row},${c}`);
      }

      // Vertical run through (row, col)
      const up = row - countLine(board, row, col, -1, 0) + 1;
      const down = row + countLine(board, row, col, 1, 0) - 1;
      if (down - up + 1 >= MIN_MATCH_LENGTH) {
        for (let r = up; r <= down; r++) matchKeys.add(`${r},${col}`);
      }
    }
  }

  return Array.from(matchKeys, key => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });
}

/** Returns a new board with the given match positions cleared (set to null). */
export function removeMatches(board: Board, matches: Position[]): Board {
  const newBoard = board.map(r => [...r]);
  for (const { row, col } of matches) {
    newBoard[row][col] = null;
  }
  return newBoard;
}

/**
 * Applies gravity: candies fall downward in each column.
 * Returns a new board; candy objects that move are recreated with updated row/col (immutable).
 */
export function applyGravity(board: Board): Board {
  const newBoard = board.map(r => [...r]);

  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1;
    for (let readRow = BOARD_SIZE - 1; readRow >= 0; readRow--) {
      const candy = newBoard[readRow][col];
      if (candy !== null) {
        if (readRow !== writeRow) {
          newBoard[writeRow][col] = candyWithPosition(candy, writeRow, col);
          newBoard[readRow][col] = null;
        }
        writeRow--;
      }
    }
  }

  return newBoard;
}

/** Fills null cells with new candies (e.g. after gravity). */
export function fillEmptySpaces(board: Board): Board {
  const newBoard = board.map(r => [...r]);
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = createCandy(row, col);
      }
    }
  }
  return newBoard;
}

/** Returns true if the two positions are adjacent (one step horizontally or vertically). */
export function areAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Returns a new board with the candies at pos1 and pos2 swapped.
 * Candy row/col properties are updated to match their new positions.
 */
export function swapCandies(board: Board, pos1: Position, pos2: Position): Board {
  const newBoard = board.map(r => [...r]);
  const a = newBoard[pos1.row][pos1.col];
  const b = newBoard[pos2.row][pos2.col];
  newBoard[pos1.row][pos1.col] = b ? candyWithPosition(b, pos1.row, pos1.col) : null;
  newBoard[pos2.row][pos2.col] = a ? candyWithPosition(a, pos2.row, pos2.col) : null;
  return newBoard;
}
