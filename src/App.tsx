
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameScreen from './screens/GameScreen';
import StartMenu from './screens/StartMenu';
import GameOverScreen from './screens/GameOverScreen';
import InstructionsScreen from './screens/InstructionsScreen';
import MusicToggleButton from './components/ui/MusicToggleButton';
import MusicPlayer from './services/MusicPlayer';
import { GameState, GameStats } from './types';
import PauseMenu from './screens/PauseMenu';
import AuthScreen from './screens/AuthScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import { useAuth } from './hooks/useAuth';
import ShopScreen from './screens/ShopScreen';
import LockerScreen from './screens/LockerScreen';

const App: React.FC = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(GameState.AUTH);
  const [lastScore, setLastScore] = useState(0);
  const [lastGameStats, setLastGameStats] = useState<GameStats>({ goldenEggs: 0, bombsHit: 0, rottenHit: 0, starsCaught: 0, magnetsCaught: 0 });
  
  const musicPlayer = useRef(new MusicPlayer());
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    if (user) {
      setGameState(GameState.START_MENU);
    } else {
      setGameState(GameState.AUTH);
    }
  }, [user]);

  const handleToggleMusic = useCallback(() => {
    musicPlayer.current.toggle();
    setIsMusicPlaying(prev => !prev);
  }, []);

  const handleStartGame = useCallback(() => {
    setLastScore(0);
    setLastGameStats({ goldenEggs: 0, bombsHit: 0, rottenHit: 0, starsCaught: 0, magnetsCaught: 0 });
    setGameState(GameState.PLAYING);
  }, []);
  
  const handleGameOver = useCallback((finalScore: number, stats: GameStats) => {
    setLastScore(finalScore);
    setLastGameStats(stats);
    setGameState(GameState.GAME_OVER);
  }, []);

  const handlePause = useCallback(() => { if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED); }, [gameState]);
  const handleResume = useCallback(() => setGameState(GameState.PLAYING), []);
  const handleBackToMenu = useCallback(() => setGameState(GameState.START_MENU), []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.AUTH:
        return <AuthScreen />;
      case GameState.START_MENU:
        return <StartMenu 
            onStart={handleStartGame} 
            onShowInstructions={() => setGameState(GameState.INSTRUCTIONS)} 
            onShowLeaderboard={() => setGameState(GameState.LEADERBOARD)}
            onShowShop={() => setGameState(GameState.SHOP)}
            onShowLocker={() => setGameState(GameState.LOCKER)}
        />;
      case GameState.INSTRUCTIONS:
        return <InstructionsScreen onBack={handleBackToMenu} />;
      case GameState.LEADERBOARD:
        return <LeaderboardScreen onBack={handleBackToMenu} />;
      case GameState.SHOP:
        return <ShopScreen onBack={handleBackToMenu} />;
      case GameState.LOCKER:
        return <LockerScreen onBack={handleBackToMenu} />;
      case GameState.PLAYING:
      case GameState.PAUSED:
        return (
          <>
            <GameScreen 
              onGameOver={handleGameOver} 
              onPause={handlePause} 
              isPaused={gameState === GameState.PAUSED} 
            />
            {gameState === GameState.PAUSED && (
              <PauseMenu 
                onResume={handleResume} 
                onRestart={handleStartGame} 
                onBack={handleBackToMenu}
              />
            )}
          </>
        );
      case GameState.GAME_OVER:
        return <GameOverScreen score={lastScore} onRestart={handleStartGame} stats={lastGameStats} />;
      default:
        return <AuthScreen />;
    }
  };

  return (
    <div className="bg-transparent text-[#0048ab] min-h-screen flex items-center justify-center font-sans">
      <div className="relative w-full h-full max-w-screen-lg max-h-screen-md aspect-[4/3]">
        {gameState !== GameState.AUTH && <MusicToggleButton isMusicPlaying={isMusicPlaying} onToggle={handleToggleMusic} />}
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
