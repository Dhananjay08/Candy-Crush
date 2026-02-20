import { Candy, Position } from '../types/game';
import { BOARD_SIZE, CANDY_COLORS } from '../constants/game';

export function createCandy(row: number, col: number): Candy {
  const color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
  return {
    id: `${row}-${col}-${Date.now()}-${Math.random()}`,
    color,
    row,
    col,
  };
}

export function initializeBoard(): (Candy | null)[][] {
  const board: (Candy | null)[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let candy = createCandy(row, col);
      board[row][col] = candy;
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

export function hasMatches(board: (Candy | null)[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (checkMatch(board, row, col)) {
        return true;
      }
    }
  }
  return false;
}

export function checkMatch(board: (Candy | null)[][], row: number, col: number): boolean {
  const candy = board[row][col];
  if (!candy) return false;

  let horizontalCount = 1;
  let verticalCount = 1;

  let left = col - 1;
  while (left >= 0 && board[row][left]?.color === candy.color) {
    horizontalCount++;
    left--;
  }
  let right = col + 1;
  while (right < BOARD_SIZE && board[row][right]?.color === candy.color) {
    horizontalCount++;
    right++;
  }

  let up = row - 1;
  while (up >= 0 && board[up][col]?.color === candy.color) {
    verticalCount++;
    up--;
  }
  let down = row + 1;
  while (down < BOARD_SIZE && board[down][col]?.color === candy.color) {
    verticalCount++;
    down++;
  }

  return horizontalCount >= 3 || verticalCount >= 3;
}

export function findAllMatches(board: (Candy | null)[][]): Position[] {
  const matches: Set<string> = new Set();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const candy = board[row][col];
      if (!candy) continue;

      let horizontalCount = 1;
      let horizontalPositions: Position[] = [{ row, col }];

      let left = col - 1;
      while (left >= 0 && board[row][left]?.color === candy.color) {
        horizontalCount++;
        horizontalPositions.push({ row, col: left });
        left--;
      }
      let right = col + 1;
      while (right < BOARD_SIZE && board[row][right]?.color === candy.color) {
        horizontalCount++;
        horizontalPositions.push({ row, col: right });
        right++;
      }

      if (horizontalCount >= 3) {
        horizontalPositions.forEach(pos => matches.add(`${pos.row},${pos.col}`));
      }

      let verticalCount = 1;
      let verticalPositions: Position[] = [{ row, col }];

      let up = row - 1;
      while (up >= 0 && board[up][col]?.color === candy.color) {
        verticalCount++;
        verticalPositions.push({ row: up, col });
        up--;
      }
      let down = row + 1;
      while (down < BOARD_SIZE && board[down][col]?.color === candy.color) {
        verticalCount++;
        verticalPositions.push({ row: down, col });
        down++;
      }

      if (verticalCount >= 3) {
        verticalPositions.forEach(pos => matches.add(`${pos.row},${pos.col}`));
      }
    }
  }

  return Array.from(matches).map(key => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });
}

export function removeMatches(board: (Candy | null)[][], matches: Position[]): (Candy | null)[][] {
  const newBoard = board.map(row => [...row]);
  matches.forEach(({ row, col }) => {
    newBoard[row][col] = null;
  });
  return newBoard;
}

export function applyGravity(board: (Candy | null)[][]): (Candy | null)[][] {
  const newBoard = board.map(row => [...row]);

  for (let col = 0; col < BOARD_SIZE; col++) {
    let emptyRow = BOARD_SIZE - 1;

    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col] !== null) {
        if (row !== emptyRow) {
          const candy = newBoard[row][col];
          newBoard[emptyRow][col] = candy;
          if (candy) {
            candy.row = emptyRow;
          }
          newBoard[row][col] = null;
        }
        emptyRow--;
      }
    }
  }

  return newBoard;
}

export function fillEmptySpaces(board: (Candy | null)[][]): (Candy | null)[][] {
  const newBoard = board.map(row => [...row]);

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = createCandy(row, col);
      }
    }
  }

  return newBoard;
}

export function areAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function swapCandies(
  board: (Candy | null)[][],
  pos1: Position,
  pos2: Position
): (Candy | null)[][] {
  const newBoard = board.map(row => [...row]);
  const temp = newBoard[pos1.row][pos1.col];
  newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col];
  newBoard[pos2.row][pos2.col] = temp;

  if (newBoard[pos1.row][pos1.col]) {
    newBoard[pos1.row][pos1.col]!.row = pos1.row;
    newBoard[pos1.row][pos1.col]!.col = pos1.col;
  }
  if (newBoard[pos2.row][pos2.col]) {
    newBoard[pos2.row][pos2.col]!.row = pos2.row;
    newBoard[pos2.row][pos2.col]!.col = pos2.col;
  }

  return newBoard;
}
