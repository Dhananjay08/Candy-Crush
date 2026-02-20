/**
 * Single candy cell: clickable and shows selection, match, fall, and swap animations.
 * Memoized so it only re-renders when its props change.
 */

import { memo } from 'react';
import { Circle } from 'lucide-react';
import { CandyColor } from '../types/game';
import { CANDY_COLOR_MAP } from '../constants/game';

export type SwapDirection = 'from-left' | 'from-right' | 'from-top' | 'from-bottom';

interface CandyProps {
  color: CandyColor;
  isSelected: boolean;
  isMatched?: boolean;
  isFalling?: boolean;
  swapDirection?: SwapDirection;
  onClick: () => void;
}

function CandyComponent({
  color,
  isSelected,
  isMatched,
  isFalling,
  swapDirection,
  onClick,
}: CandyProps) {
  const backgroundColor = CANDY_COLOR_MAP[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full h-full rounded-lg flex items-center justify-center
        transition-all duration-200 transform hover:scale-105
        ${isSelected ? 'ring-4 ring-white scale-110 shadow-lg' : 'shadow-md'}
        ${isMatched ? 'animate-pop' : ''}
        ${isFalling ? 'animate-slide-down' : ''}
        ${swapDirection === 'from-left' ? 'animate-swap-from-left' : ''}
        ${swapDirection === 'from-right' ? 'animate-swap-from-right' : ''}
        ${swapDirection === 'from-top' ? 'animate-swap-from-top' : ''}
        ${swapDirection === 'from-bottom' ? 'animate-swap-from-bottom' : ''}
      `}
      style={{ backgroundColor }}
      aria-label={`Candy ${color}`}
    >
      <Circle
        size={32}
        fill="white"
        color="white"
        className="opacity-80"
        aria-hidden
      />
    </button>
  );
}

export const Candy = memo(CandyComponent);
