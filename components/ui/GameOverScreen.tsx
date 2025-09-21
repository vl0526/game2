import React, { useState, useEffect } from 'react';
import DoodleButton from './DoodleButton';
import { GameStats } from '../../types';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  stats: GameStats;
  playerName: string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart, stats, playerName }) => {
  const [aiMessage, setAiMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAiSummary = async () => {
      // More robust check for API key to prevent crashes in unusual environments that might throw errors on property access.
      if (typeof process === 'undefined' || typeof process.env === 'undefined' || !('API_KEY' in process.env) || !process.env.API_KEY) {
        setAiMessage("Great attempt! Check your schematics and try again for an even better score.");
        setIsLoading(false);
        return;
      }

      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `You are a quirky engineering professor writing a performance review for an engineer-in-training named ${playerName}. They just finished a simulation for your "Advanced Egg Catching Dynamics" class.
        Here are their performance metrics:
        - Final Score: ${score}
        - Golden Prototypes Caught: ${stats.goldenEggs}
        - Score Multipliers Utilized: ${stats.starsCaught}
        - Explosive Collisions: ${stats.bombsHit}
        - Volatile Compound Contaminations (rotten eggs): ${stats.rottenHit}

        Write a short, witty, and encouraging one-paragraph performance review (3-4 sentences). Be funny and use blueprint/engineering jargon. Address the student by their name, ${playerName}. Do not use markdown formatting.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setAiMessage(response.text);

      } catch (e) {
        console.error("Error fetching AI summary:", e);
        const errorMessage = "The AI professor is on a coffee break. But they'd probably say you did a solid job!";
        setError(errorMessage);
        setAiMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiSummary();
  }, [score, stats, playerName]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <h1 className="text-7xl md:text-8xl font-bold text-[#0048ab]" style={{ fontFamily: "'Kalam', cursive" }}>
        Game Over
      </h1>
      <div className="mt-8 text-3xl space-y-4" style={{ fontFamily: "'Kalam', cursive" }}>
        <p>Your Score: <span className="font-bold text-black">{score}</span></p>
        <p>High Score: <span className="font-bold text-black">{highScore}</span></p>
      </div>

      <div className="mt-8 p-6 border-4 border-dashed border-[#0048ab] rounded-2xl max-w-xl min-h-[150px] flex items-center justify-center">
        {isLoading && <p className="text-xl" style={{ fontFamily: "'Kalam', cursive" }}>Calculating performance metrics...</p>}
        {!isLoading && (
            <p className={`text-xl ${error ? 'text-red-600' : 'text-gray-800'}`} style={{ fontFamily: "'Kalam', cursive" }}>
                {aiMessage}
            </p>
        )}
      </div>

      <div className="mt-12">
        <DoodleButton onClick={onRestart}>
          Chơi lại
        </DoodleButton>
      </div>
    </div>
  );
};

export default GameOverScreen;