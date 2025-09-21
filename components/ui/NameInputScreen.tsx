import React, { useState } from 'react';
import DoodleButton from './DoodleButton';

interface NameInputScreenProps {
  onNameSubmit: (name: string) => void;
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8 text-center">
      <h1 className="text-6xl md:text-7xl font-bold text-[#0048ab] mb-6" style={{ fontFamily: "'Kalam', cursive" }}>
        Project Blueprint
      </h1>
      <p className="text-2xl mb-8" style={{ fontFamily: "'Kalam', cursive" }}>Enter your engineer codename:</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={15}
          className="text-center text-3xl font-bold bg-transparent text-[#0048ab] py-3 px-6 border-4 border-dashed border-[#0048ab] rounded-lg focus:outline-none focus:border-solid w-80"
          style={{ fontFamily: "'Kalam', cursive" }}
          placeholder="Codename..."
          aria-label="Enter your codename"
          autoFocus
        />
        <div className="mt-8">
          <DoodleButton type="submit" disabled={!name.trim()}>
            Begin Operation
          </DoodleButton>
        </div>
      </form>
    </div>
  );
};

export default NameInputScreen;
