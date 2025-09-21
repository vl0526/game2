import React from 'react';
import DoodleButton from './DoodleButton';

interface StartMenuProps {
  onStart: () => void;
  onShowInstructions: () => void;
  onShowLeaderboard: () => void;
  playerName: string;
  highScore: number;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart, onShowInstructions, onShowLeaderboard, playerName, highScore }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <h1 className="text-8xl md:text-9xl font-bold text-[#0048ab]" style={{ fontFamily: "'Kalam', cursive" }}>
        Bắt Trứng
      </h1>
      <div className="mt-4 text-center">
        <p className="text-2xl text-gray-700">Engineer: <span className="font-bold text-black">{playerName}</span></p>
        <p className="text-2xl text-gray-700">Top Schematic Score: <span className="font-bold text-black">{highScore}</span></p>
      </div>
      <div className="mt-12 space-y-6 flex flex-col items-center">
        <DoodleButton onClick={onStart}>
          Bắt đầu
        </DoodleButton>
        <DoodleButton onClick={onShowLeaderboard}>
          Bảng xếp hạng
        </DoodleButton>
        <DoodleButton onClick={onShowInstructions}>
          Hướng dẫn
        </DoodleButton>
      </div>
    </div>
  );
};

export default StartMenu;
