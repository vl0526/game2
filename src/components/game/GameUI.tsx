import React from 'react';
import {
  GAME_WIDTH, MAX_DIFFICULTY_SCORE, COMBO_THRESHOLD,
  PRIMARY_COLOR, GOLDEN_EGG_COLOR, STAR_COLOR, CLOCK_COLOR,
  SLOW_MOTION_DURATION, MULTIPLIER_DURATION
} from '../../constants';

interface GameUIProps {
  score: number;
  lives: number;
  comboCounter: number;
  comboActive: boolean;
  scoreMultiplier: number;
  slowMoTimer: number;
  multiplierTimer: number;
}

const TextStyle = { fontFamily: "'Kalam', cursive", fontWeight: 'bold' };

export const GameUI: React.FC<GameUIProps> = (props) => {
  const { score, lives, comboCounter, comboActive, scoreMultiplier, slowMoTimer, multiplierTimer } = props;

  const difficultyProgress = Math.min(score / MAX_DIFFICULTY_SCORE, 1);
  const comboProgress = comboCounter / COMBO_THRESHOLD;
  const slowMoProgress = slowMoTimer / SLOW_MOTION_DURATION;
  const multiplierProgress = multiplierTimer / MULTIPLIER_DURATION;

  return (
    <div className="absolute inset-0 pointer-events-none text-[#0048ab] z-10">
      {/* Score and Lives */}
      <div className="absolute top-4 left-5 text-4xl" style={TextStyle}>
        Điểm: {score}
      </div>
      <div className="absolute top-5 right-5 flex space-x-2">
        {Array.from({ length: lives }).map((_, i) => (
          <div key={i} className="w-[30px] h-[40px] border-4 rounded-[50%]" style={{ borderColor: PRIMARY_COLOR }}></div>
        ))}
      </div>

      {/* Difficulty Bar */}
      <div className="absolute top-0 left-0 h-[5px] bg-[#0048ab]" style={{ width: `${difficultyProgress * 100}%` }}></div>

      {/* Combo / Multiplier Text */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-5xl text-center w-full" style={TextStyle}>
        {comboActive && <span style={{ color: GOLDEN_EGG_COLOR, textShadow: `0 0 10px ${GOLDEN_EGG_COLOR}` }}>COMBO x2!</span>}
        {!comboActive && scoreMultiplier > 1 && <span style={{ color: STAR_COLOR, textShadow: `0 0 10px ${STAR_COLOR}` }}>ĐIỂM x{scoreMultiplier}!</span>}
      </div>

      {/* Combo Bar */}
      {comboCounter > 0 && !comboActive && (
        <div className="absolute top-[70px] left-1/2 -translate-x-1/2 w-[200px] h-[15px] border-2" style={{ borderColor: PRIMARY_COLOR }}>
          <div className="h-full" style={{ width: `${Math.min(comboProgress, 1) * 100}%`, backgroundColor: PRIMARY_COLOR }}></div>
        </div>
      )}

      {/* Power-up Bars */}
      <div className="absolute bottom-0 left-0 w-full h-[10px]">
        {slowMoTimer > 0 && <div className="absolute bottom-0 left-0 h-full" style={{ width: `${slowMoProgress * 100}%`, backgroundColor: `${CLOCK_COLOR}80`}}></div>}
        {multiplierTimer > 0 && <div className="absolute bottom-0 left-0 h-full" style={{ width: `${multiplierProgress * 100}%`, backgroundColor: `${STAR_COLOR}80`}}></div>}
      </div>
    </div>
  );
};
