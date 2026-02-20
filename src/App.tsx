import { RefreshCw, Trophy, Zap } from 'lucide-react';
import { GameBoard } from './components/GameBoard';
import { useGameState } from './hooks/useGameState';

function App() {
  const {
    board,
    selectedCandy,
    score,
    moves,
    handleCandyClick,
    resetGame,
    matchedPositions,
    fallingPositions,
    lastSwap,
  } = useGameState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-6xl font-bold text-white mb-2 drop-shadow-lg">
          Candy Crush
        </h1>
        <p className="text-xl text-white/90">Match 3 or more candies to score!</p>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-6">
        <div className="flex gap-8 justify-center mb-6">
          <div className="flex items-center gap-2 bg-white/30 px-6 py-3 rounded-xl">
            <Trophy className="text-yellow-300" size={28} />
            <div className="text-left">
              <div className="text-xs text-white/80 font-medium">Score</div>
              <div className="text-2xl font-bold text-white">{score}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/30 px-6 py-3 rounded-xl">
            <Zap className="text-blue-300" size={28} />
            <div className="text-left">
              <div className="text-xs text-white/80 font-medium">Moves</div>
              <div className="text-2xl font-bold text-white">{moves}</div>
            </div>
          </div>
        </div>

        <GameBoard
          board={board}
          selectedCandy={selectedCandy}
          matchedPositions={matchedPositions}
          fallingPositions={fallingPositions}
          lastSwap={lastSwap}
          onCandyClick={handleCandyClick}
        />

        <button
          onClick={resetGame}
          className="mt-6 w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} />
          New Game
        </button>
      </div>

      <div className="text-center text-white/80 text-sm max-w-md">
        <p>Click on a candy, then click on an adjacent candy to swap them.</p>
        <p className="mt-1">Match 3 or more candies of the same color to score points!</p>
      </div>
    </div>
  );
}

export default App;
