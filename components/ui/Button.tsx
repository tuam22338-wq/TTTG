import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'choice' | 'guide';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'w-full rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60';
  
  const variantClasses = {
    primary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-[0_4px_15px_rgba(192,37,133,0.4)] hover:shadow-[0_6px_20px_rgba(192,37,133,0.5)] focus:ring-pink-500',
    secondary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold bg-white/5 border border-white/20 hover:bg-white/10 text-white focus:ring-white',
    choice: 'bg-white/5 hover:bg-white/10 text-white text-base py-2.5 font-semibold rounded-lg border border-white/10 hover:border-white/20 disabled:bg-transparent disabled:text-gray-500 disabled:border-neutral-700',
    guide: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold bg-white/5 border border-white/20 hover:bg-white/10 text-white focus:ring-neutral-400',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;