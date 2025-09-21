
import React from 'react';
import DoodleButton from '../components/ui/DoodleButton';
import { useAuth } from '../hooks/useAuth';

interface StartMenuProps {
  onStart: () => void;
  onShowInstructions: () => void;
  onShowLeaderboard: () => void;
  onShowShop: () => void;
  onShowLocker: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart, onShowInstructions, onShowLeaderboard, onShowShop, onShowLocker }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <div className="absolute top-4 left-4 text-left text-2xl" style={{ fontFamily: "'Kalam', cursive" }}>
        <p className="text-gray-700">Kỹ sư: <span className="font-bold text-black">{user.name}</span></p>
        <p className="text-gray-700">Điểm cao: <span className="font-bold text-black">{user.highScore}</span></p>
        <p className="text-gray-700">Coins: <span className="font-bold text-yellow-500">{user.coins}</span></p>
      </div>

      <h1 className="text-8xl md:text-9xl font-bold text-[#0048ab]" style={{ fontFamily: "'Kalam', cursive" }}>
        Bắt Trứng
      </h1>
      
      <div className="mt-8 space-y-5 flex flex-col items-center">
        <DoodleButton onClick={onStart}>Bắt đầu</DoodleButton>
        <div className="flex space-x-4">
            <DoodleButton onClick={onShowShop} className="px-8 text-2xl">Cửa hàng</DoodleButton>
            <DoodleButton onClick={onShowLocker} className="px-8 text-2xl">Tủ đồ</DoodleButton>
        </div>
        <DoodleButton onClick={onShowLeaderboard}>Bảng xếp hạng</DoodleButton>
        <DoodleButton onClick={onShowInstructions}>Hướng dẫn</DoodleButton>
        <DoodleButton disabled>PvP (Sắp có)</DoodleButton>
      </div>
    </div>
  );
};

export default StartMenu;
