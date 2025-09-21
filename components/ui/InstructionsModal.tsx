import React from 'react';
import DoodleButton from './DoodleButton';
import { ROTTEN_EGG_COLOR, GOLDEN_EGG_COLOR, PRIMARY_COLOR, BOMB_COLOR, HEART_COLOR, CLOCK_COLOR, STAR_COLOR } from '../../constants';

const InstructionsModal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const instructions = [
    { name: 'Trứng Thường', color: PRIMARY_COLOR, description: '+1 điểm. Đừng để rơi!', shape: 'egg' },
    { name: 'Trứng Vàng', color: GOLDEN_EGG_COLOR, description: '+5 điểm! Rất hiếm.', shape: 'egg' },
    { name: 'Trái Tim', color: HEART_COLOR, description: 'Phục hồi 1 mạng.', shape: 'heart' },
    { name: 'Đồng Hồ', color: CLOCK_COLOR, description: 'Làm chậm thời gian.', shape: 'clock' },
    { name: 'Ngôi Sao', color: STAR_COLOR, description: 'x2 điểm trong 7 giây!', shape: 'star' },
    { name: 'Trứng Thối', color: ROTTEN_EGG_COLOR, description: 'Bắt trúng sẽ -1 mạng.', shape: 'egg' },
    { name: 'Bom', color: BOMB_COLOR, description: 'BÙM! Bắt trúng sẽ -1 mạng.', shape: 'bomb' },
  ];

  const ItemIcon: React.FC<{ item: typeof instructions[0] }> = ({ item }) => {
    const iconStyle = { color: item.color, borderColor: item.color };
    switch (item.shape) {
      case 'egg':
        return <div className="w-10 h-14 rounded-[50%]" style={{ border: `4px solid ${item.color}` }}></div>;
      case 'bomb':
        return <div className="w-12 h-12 rounded-full" style={{ border: `4px solid ${ROTTEN_EGG_COLOR}`, backgroundColor: BOMB_COLOR }}></div>;
      case 'star':
        return <div className="text-6xl" style={{ color: item.color, filter: `drop-shadow(0 0 5px ${item.color})` }}>★</div>;
      case 'heart':
        return <div className="text-5xl" style={iconStyle}>♥</div>;
      case 'clock':
        return <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center" style={iconStyle}>
          <div style={{width: '2px', height: '1rem', backgroundColor: 'currentColor', transform: 'rotate(12deg)', marginRight: '-2px'}}></div>
          <div style={{width: '2px', height: '0.75rem', backgroundColor: 'currentColor', transform: 'translateY(-2px) rotate(-45deg)'}}></div>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-4 md:p-8 text-[#0048ab]">
      <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Kalam', cursive" }}>
        Hướng dẫn
      </h1>
      
      <div className="text-left max-w-lg w-full space-y-4 text-lg text-gray-800" style={{ fontFamily: "'Kalam', cursive" }}>
        <p><span className="font-bold text-[#0048ab]">Điều khiển (PC):</span> Dùng phím A/D hoặc mũi tên Trái/Phải để di chuyển.</p>
        <p><span className="font-bold text-[#0048ab]">Điều khiển (Mobile):</span> Chạm và kéo để di chuyển.</p>
        <p><span className="font-bold text-[#0048ab]">Tạm dừng:</span> Nhấn phím P.</p>
        <p className="mt-4"><span className="font-bold text-[#0048ab]">Mục tiêu:</span> Hứng các vật phẩm để ghi điểm và sống sót lâu nhất!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 w-full max-w-3xl">
        {instructions.map(item => (
          <div key={item.name} className="p-3 border-4 border-dashed border-[#0048ab] rounded-2xl flex flex-col items-center text-center h-full">
            <div className="w-12 h-14 flex items-center justify-center mb-2">
              <ItemIcon item={item} />
            </div>
            <h3 className="font-bold text-xl" style={{color: item.color, fontFamily: "'Kalam', cursive"}}>{item.name}</h3>
            <p className="text-gray-800 text-sm mt-auto" style={{ fontFamily: "'Kalam', cursive" }}>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <DoodleButton onClick={onBack}>
          Trở về
        </DoodleButton>
      </div>
    </div>
  );
};

export default InstructionsModal;
