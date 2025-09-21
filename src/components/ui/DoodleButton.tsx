
import React from 'react';

interface DoodleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const DoodleButton: React.FC<DoodleButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="text-3xl font-bold bg-transparent text-[#0048ab] py-4 px-12 border-4 border-[#0048ab] rounded-lg hover:bg-[#0048ab] hover:text-[#f4f1de] transition-colors duration-200 transform hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-transparent disabled:text-[#0048ab]"
      style={{ fontFamily: "'Kalam', cursive" }}
      {...props}
    >
      {children}
    </button>
  );
};

export default DoodleButton;
