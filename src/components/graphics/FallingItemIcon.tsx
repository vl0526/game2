import React from 'react';
import { EggType } from '../../types';
import { 
  PRIMARY_COLOR, GOLDEN_EGG_COLOR, ROTTEN_EGG_COLOR, BOMB_COLOR, HEART_COLOR, CLOCK_COLOR, STAR_COLOR, LINE_WIDTH 
} from '../../constants';

interface FallingItemIconProps {
  type: EggType;
  width: number;
  height: number;
}

export const FallingItemIcon: React.FC<FallingItemIconProps> = ({ type, width, height }) => {
  const lw = LINE_WIDTH - 2;

  const renderIcon = () => {
    switch (type) {
      case EggType.NORMAL:
        return <ellipse cx={width/2} cy={height/2} rx={(width/2) - lw/2} ry={(height/2)- lw/2} stroke={PRIMARY_COLOR} strokeWidth={lw} fill="none" />;
      case EggType.GOLDEN:
        return (
          <>
            <defs>
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ellipse cx={width/2} cy={height/2} rx={(width/2) - lw/2} ry={(height/2)- lw/2} stroke={GOLDEN_EGG_COLOR} strokeWidth={lw} fill="none" style={{filter: "url(#glow-gold)"}} />
          </>
        );
      case EggType.ROTTEN:
        return <ellipse cx={width/2} cy={height/2} rx={(width/2) - lw/2} ry={(height/2)- lw/2} stroke={ROTTEN_EGG_COLOR} strokeWidth={lw} fill="none" />;
      case EggType.BOMB:
        const radius = width/2 - lw/2;
        return (
          <g>
            <circle cx={width/2} cy={height/2} r={radius} fill={BOMB_COLOR} stroke={ROTTEN_EGG_COLOR} strokeWidth={lw} />
            <path d={`M ${width/2},${height/2 - radius} Q ${width/2 + 10},${height/2 - radius - 10} ${width/2 + 5},${height/2 - radius - 15}`} stroke={ROTTEN_EGG_COLOR} strokeWidth={lw} fill="none" />
          </g>
        );
      case EggType.HEART:
        const hx = lw / 2;
        const hy = lw / 2;
        const hw = width - lw;
        const hh = height - lw;
        const topCurveHeight = hh * 0.3;
        const heartPath = `
          M ${hx + hw / 2},${hy + topCurveHeight}
          C ${hx},${hy} ${hx},${hy + hh/2} ${hx + hw/2},${hy + hh}
          C ${hx + hw},${hy + hh/2} ${hx + hw},${hy} ${hx + hw/2},${hy + topCurveHeight}
        `;
        return <path d={heartPath} stroke={HEART_COLOR} strokeWidth={lw} fill="none" />;
      case EggType.CLOCK:
        const cr = width/2 - lw/2;
        return (
          <g stroke={CLOCK_COLOR} strokeWidth={lw} fill="none">
            <circle cx={width/2} cy={height/2} r={cr} />
            <line x1={width/2} y1={height/2} x2={width/2} y2={height/2 - cr + 5} />
            <line x1={width/2} y1={height/2} x2={width/2 + cr - 5} y2={height/2} />
          </g>
        );
      case EggType.STAR:
        const spikes = 5;
        const outerRadius = width / 2;
        const innerRadius = outerRadius / 2;
        let points = "";
        let rot = Math.PI / 2 * 3;
        const cx = width / 2;
        const cy = height / 2;
        const step = Math.PI / spikes;
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = cx + Math.cos(rot) * radius;
          const y = cy + Math.sin(rot) * radius;
          points += `${x},${y} `;
          rot += step;
        }
        return (
            <>
                <defs>
                    <filter id="glow-star" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <polygon points={points} stroke={STAR_COLOR} fill={`${STAR_COLOR}80`} strokeWidth={lw-1} style={{filter: "url(#glow-star)"}}/>
            </>
        );
      default:
        return null;
    }
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {renderIcon()}
    </svg>
  );
};
