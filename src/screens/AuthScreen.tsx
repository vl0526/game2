
import React, { useState } from 'react';
import DoodleButton from '../components/ui/DoodleButton';
import { useAuth } from '../hooks/useAuth';

const AuthScreen: React.FC = () => {
  const [name, setName] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <h1 className="text-6xl md:text-7xl font-bold text-[#0048ab] mb-6" style={{ fontFamily: "'Kalam', cursive" }}>
        Dự Án Bắt Trứng
      </h1>
      <p className="text-2xl mb-8" style={{ fontFamily: "'Kalam', cursive" }}>Nhập biệt danh Kỹ sư của bạn:</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={15}
          className="text-center text-3xl font-bold bg-transparent text-[#0048ab] py-3 px-6 border-4 border-dashed border-[#0048ab] rounded-lg focus:outline-none focus:border-solid w-80"
          style={{ fontFamily: "'Kalam', cursive" }}
          placeholder="Biệt danh..."
          aria-label="Nhập biệt danh của bạn"
          autoFocus
        />
        <div className="mt-8">
          <DoodleButton type="submit" disabled={!name.trim()}>
            Bắt Đầu Vận Hành
          </DoodleButton>
        </div>
      </form>
       <p className="text-lg mt-8 text-gray-600" style={{ fontFamily: "'Kalam', cursive" }}>
          Mẹo: Đăng nhập với tên "admin" để mở khóa chế độ đặc biệt!
        </p>
    </div>
  );
};

export default AuthScreen;
