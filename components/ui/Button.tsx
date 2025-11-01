import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'choice' | 'guide';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] focus:ring-white/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
  
  const variantClasses = {
    primary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold text-white neumorphic-convex hover:brightness-110 active:shadow-[inset_4px_4px_8px_#141414,_inset_-4px_-4px_8px_#202020] active:brightness-95',
    secondary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold glassmorphic hover:bg-white/20 text-white',
    choice: 'bg-white/5 hover:bg-white/10 text-white text-base py-2.5 font-semibold rounded-lg border border-white/10 hover:border-white/20 active:bg-white/20 disabled:bg-transparent disabled:text-gray-500 disabled:border-neutral-700',
    guide: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold glassmorphic hover:bg-white/20 text-white',
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