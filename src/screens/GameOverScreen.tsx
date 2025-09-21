
import React, { useState, useEffect } from 'react';
import DoodleButton from '../components/ui/DoodleButton';
import { GameStats } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabaseService } from '../services/supabaseService';
import { COIN_CONVERSION_RATE } from '../constants';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  stats: GameStats;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, stats }) => {
  const { user, updateUser } = useAuth();
  const [aiMessage, setAiMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const coinsEarned = Math.floor(score / COIN_CONVERSION_RATE);

  useEffect(() => {
    if (user) {
        const updatedUser = supabaseService.saveUserProgress(user.name, score, coinsEarned);
        updateUser(updatedUser);
    }
  }, [score, coinsEarned, user, updateUser]);

  useEffect(() => {
    const fetchAiSummary = async () => {
      if (!user || !process.env.API_KEY) {
        setAiMessage("Làm tốt lắm, kỹ sư! Hãy xem lại bản thiết kế và thử lại để đạt điểm cao hơn.");
        setIsLoading(false);
        return;
      }

      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Bạn là một giáo sư kỹ thuật lập dị đang viết bài đánh giá hiệu suất cho một kỹ sư tập sự tên là ${user.name}. Họ vừa hoàn thành một bài mô phỏng cho lớp "Động lực học Bắt Trứng Nâng cao" của bạn.
        Đây là các chỉ số hiệu suất của họ:
        - Điểm cuối cùng: ${score}
        - Nguyên mẫu Vàng bắt được: ${stats.goldenEggs}
        - Va chạm gây nổ: ${stats.bombsHit}
        
        Viết một bài đánh giá hiệu suất ngắn gọn (2-3 câu), dí dỏm và đáng khích lệ. Hãy gọi sinh viên bằng tên của họ. Không sử dụng định dạng markdown.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        setAiMessage(response.text);
      } catch (e) {
        console.error("Error fetching AI summary:", e);
        setAiMessage("Vị giáo sư AI đang đi uống cà phê. Nhưng có lẽ ông ấy sẽ nói rằng bạn đã làm rất tốt!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAiSummary();
  }, [score, stats, user]);

  if (!user) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <h1 className="text-7xl md:text-8xl font-bold text-[#0048ab]" style={{ fontFamily: "'Kalam', cursive" }}>
        Nhiệm Vụ Hoàn Thành
      </h1>
      <div className="mt-6 text-3xl space-y-3" style={{ fontFamily: "'Kalam', cursive" }}>
        <p>Điểm của bạn: <span className="font-bold text-black">{score}</span></p>
        <p>Điểm cao nhất: <span className="font-bold text-black">{user.highScore}</span></p>
        <p>Coins nhận được: <span className="font-bold text-yellow-500">+{coinsEarned}</span></p>
      </div>

      <div className="mt-6 p-6 border-4 border-dashed border-[#0048ab] rounded-2xl max-w-xl min-h-[120px] flex items-center justify-center">
        {isLoading ? (
            <p className="text-xl" style={{ fontFamily: "'Kalam', cursive" }}>Đang tính toán chỉ số hiệu suất...</p>
        ) : (
            <p className="text-xl text-gray-800" style={{ fontFamily: "'Kalam', cursive" }}>
                {aiMessage}
            </p>
        )}
      </div>

      <div className="mt-10">
        <DoodleButton onClick={onRestart}>
          Chơi lại
        </DoodleButton>
      </div>
    </div>
  );
};

export default GameOverScreen;
