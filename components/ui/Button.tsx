import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'choice' | 'guide';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-[var(--bg-main)] focus:ring-white/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
  
  const variantClasses = {
    primary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold neumorphic-convex',
    secondary: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold neumorphic-convex',
    choice: 'text-base py-2.5 font-semibold rounded-lg',
    guide: 'text-lg py-3 px-6 font-rajdhani uppercase tracking-wider font-bold neumorphic-convex',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;