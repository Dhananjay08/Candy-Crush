export type CandyColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Candy {
  id: string;
  color: CandyColor;
  row: number;
  col: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (Candy | null)[][];
  score: number;
  moves: number;
  selectedCandy: Position | null;
  isAnimating: boolean;
  shakingPositions?: Position[];
  matchedPositions?: Position[];
}
