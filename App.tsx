import React, { useState, useEffect, useCallback, useRef } from 'react';
import Game from './components/Game';
import StartMenu from './components/ui/StartMenu';
import GameOverScreen from './components/ui/GameOverScreen';
import InstructionsModal from './components/ui/InstructionsModal';
import MusicToggleButton from './components/ui/MusicToggleButton';
import MusicPlayer from './services/MusicPlayer';
import { GameState, GameStats, LeaderboardEntry } from './types';
import PauseMenu from './components/ui/PauseMenu';
import NameInputScreen from './components/ui/NameInputScreen';
import LeaderboardScreen from './components/ui/LeaderboardScreen';
import { LEADERBOARD_SIZE } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.NAME_INPUT);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const musicPlayer = useRef(new MusicPlayer());
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({ goldenEggs: 0, bombsHit: 0, rottenHit: 0, starsCaught: 0 });

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('bat_trung_player_name');
      const storedHighScore = localStorage.getItem('bat_trung_high_score');
      const storedLeaderboard = localStorage.getItem('bat_trung_leaderboard');

      if (storedName) {
        setPlayerName(storedName);
        setGameState(GameState.START_MENU);
      }
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
      if (storedLeaderboard) {
        setLeaderboard(JSON.parse(storedLeaderboard));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, []);

  const handleNameSubmit = useCallback((name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem('bat_trung_player_name', name);
    } catch (error) {
      console.error("Failed to save name to localStorage", error);
    }
    setGameState(GameState.START_MENU);
  }, []);

  const handleToggleMusic = useCallback(() => {
    musicPlayer.current.toggle();
    setIsMusicPlaying(prev => !prev);
  }, []);

  const handleStartGame = useCallback(() => {
    setScore(0);
    setGameStats({ goldenEggs: 0, bombsHit: 0, rottenHit: 0, starsCaught: 0 });
    setGameState(GameState.PLAYING);
  }, []);
  
  const handleShowInstructions = useCallback(() => setGameState(GameState.INSTRUCTIONS), []);
  const handleShowLeaderboard = useCallback(() => setGameState(GameState.LEADERBOARD), []);
  const handleBackToMenu = useCallback(() => setGameState(GameState.START_MENU), []);
  const handlePause = useCallback(() => { if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED); }, [gameState]);
  const handleResume = useCallback(() => setGameState(GameState.PLAYING), []);

  const handleGameOver = useCallback((finalScore: number, stats: GameStats) => {
    setScore(finalScore);
    setGameStats(stats);

    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('bat_trung_high_score', finalScore.toString());
      } catch (error) {
        console.error("Failed to save high score", error);
      }
    }

    // Update leaderboard
    const newLeaderboard = [...leaderboard, { name: playerName!, score: finalScore }]
      .sort((a, b) => b.score - a.score)
      .slice(0, LEADERBOARD_SIZE);

    setLeaderboard(newLeaderboard);
    try {
      localStorage.setItem('bat_trung_leaderboard', JSON.stringify(newLeaderboard));
    } catch (error) {
      console.error("Failed to save leaderboard", error);
    }

    setGameState(GameState.GAME_OVER);
  }, [highScore, playerName, leaderboard]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.NAME_INPUT:
        return <NameInputScreen onNameSubmit={handleNameSubmit} />;
      case GameState.START_MENU:
        return <StartMenu onStart={handleStartGame} onShowInstructions={handleShowInstructions} onShowLeaderboard={handleShowLeaderboard} playerName={playerName!} highScore={highScore} />;
      case GameState.INSTRUCTIONS:
        return <InstructionsModal onBack={handleBackToMenu} />;
      case GameState.LEADERBOARD:
        return <LeaderboardScreen scores={leaderboard} onBack={handleBackToMenu} />;
      case GameState.PLAYING:
      case GameState.PAUSED:
        return (
          <>
            <Game 
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
        return <GameOverScreen score={score} highScore={highScore} onRestart={handleStartGame} stats={gameStats} playerName={playerName!} />;
      default:
        return <StartMenu onStart={handleStartGame} onShowInstructions={handleShowInstructions} onShowLeaderboard={handleShowLeaderboard} playerName={playerName || "Player"} highScore={highScore} />;
    }
  };

  return (
    <div className="bg-transparent text-[#0048ab] min-h-screen flex items-center justify-center font-sans">
      <div className="relative w-full h-full max-w-screen-lg max-h-screen-md aspect-[4/3]">
        {gameState !== GameState.NAME_INPUT && <MusicToggleButton isMusicPlaying={isMusicPlaying} onToggle={handleToggleMusic} />}
        {renderContent()}
      </div>
    </div>
  );
};

export default App;