import { CandyColor } from '../types/game';

/** Number of rows/columns on the game board */
export const BOARD_SIZE = 8;

/** Minimum candies in a line to form a match */
export const MIN_MATCH_LENGTH = 3;

export const CANDY_COLORS: CandyColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export const CANDY_COLOR_MAP = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
};
