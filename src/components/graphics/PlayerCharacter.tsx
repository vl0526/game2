import React from 'react';
import {
  PLAYER_WIDTH, PLAYER_HEIGHT, BASKET_WIDTH, BASKET_HEIGHT,
  BASKET_OFFSET_Y, PRIMARY_COLOR, LINE_WIDTH
} from '../../constants';

export const PlayerCharacter: React.FC = () => {
  const centerX = PLAYER_WIDTH / 2;

  // Drawing is relative to top-left (0,0) of the component
  const basketY = BASKET_OFFSET_Y;
  const basketX = centerX - BASKET_WIDTH / 2;

  const legHeight = 20;
  const bodyHeight = 40;
  const headSize = 35;

  // Position from bottom
  const legTopY = PLAYER_HEIGHT - legHeight;
  const bodyTopY = legTopY - bodyHeight;
  const headTopY = bodyTopY - headSize;
  const bodyWidth = 40;

  const eyeY = headTopY + headSize / 2;

  const basketPath = `
    M 0,${basketY}
    L 0,${basketY + BASKET_HEIGHT}
    A 15,15 0 0,0 ${BASKET_WIDTH},${basketY + BASKET_HEIGHT}
    L ${BASKET_WIDTH},${basketY}
  `;

  return (
    <svg
      width={PLAYER_WIDTH}
      height={PLAYER_HEIGHT + 20} // Extra height for antenna
      viewBox={`0 0 ${PLAYER_WIDTH} ${PLAYER_HEIGHT + 20}`}
      style={{ overflow: 'visible', transform: 'translateY(-20px)'}}
    >
      <g
        stroke={PRIMARY_COLOR}
        strokeWidth={LINE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Legs */}
        <line x1={centerX - bodyWidth / 4} y1={legTopY} x2={centerX - bodyWidth / 4} y2={PLAYER_HEIGHT} />
        <line x1={centerX + bodyWidth / 4} y1={legTopY} x2={centerX + bodyWidth / 4} y2={PLAYER_HEIGHT} />

        {/* Body */}
        <rect x={centerX - bodyWidth / 2} y={bodyTopY} width={bodyWidth} height={bodyHeight} rx="3" />
        <g strokeWidth={LINE_WIDTH - 2}>
          <line x1={centerX - bodyWidth / 4} y1={bodyTopY + 10} x2={centerX + bodyWidth / 4} y2={bodyTopY + 10} />
          <line x1={centerX - bodyWidth / 4} y1={bodyTopY + bodyHeight - 10} x2={centerX + bodyWidth / 4} y2={bodyTopY + bodyHeight - 10} />
        </g>

        {/* Head */}
        <rect x={centerX - headSize / 2} y={headTopY} width={headSize} height={headSize} rx="3" />
        
        {/* Antenna */}
        <line x1={centerX} y1={headTopY} x2={centerX} y2={headTopY - 10} />
        <circle cx={centerX} cy={headTopY - 12} r="3" fill={PRIMARY_COLOR} stroke="none" />

        {/* Eye */}
        <circle cx={centerX} cy={eyeY} r={headSize / 4} />
        <circle cx={centerX} cy={eyeY} r={headSize / 8} fill={PRIMARY_COLOR} stroke="none" />
        
        {/* Arms */}
        <line x1={centerX - bodyWidth / 2} y1={bodyTopY + 10} x2={basketX + 5} y2={basketY + BASKET_HEIGHT / 2} />
        <line x1={centerX + bodyWidth / 2} y1={bodyTopY + 10} x2={basketX + BASKET_WIDTH - 5} y2={basketY + BASKET_HEIGHT / 2} />

        {/* Basket */}
        <path transform={`translate(${basketX}, 0)`} d={basketPath} />
      </g>
    </svg>
  );
};
