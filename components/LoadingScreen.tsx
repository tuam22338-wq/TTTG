import React, { useState, useEffect } from 'react';
import { GameLogoIcon } from './icons/GameLogoIcon';

interface LoadingScreenProps {
  onFinished: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Simulate a fixed loading time
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(onFinished, 500); // Wait for fade out animation to complete
    }, 2500); // 2.5 seconds loading time

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className={`themed-background fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-8 animate-fade-in-up">
        <GameLogoIcon className="h-32 w-32 md:h-40 md:w-40" />
        <h1 
          className="font-title text-4xl md:text-5xl font-bold" 
          style={{
            color: 'var(--text-main)',
            textShadow: "0 0 8px var(--title-glow-color-soft), 0 0 20px var(--title-glow-color-faint)"
          }}
        >
          Tam Thiên Thế Giới
        </h1>
        
        <div className="themed-spinner w-16 h-16 border-4 border-white/20 rounded-full animate-spin mt-4"></div>
        <p className="tracking-widest font-rajdhani" style={{color: 'var(--text-secondary)'}}>ĐANG TẢI...</p>
      </div>
       <style>{`
            .themed-background {
                background-color: var(--bg-main);
            }
            .themed-spinner {
                border-top-color: var(--text-main);
            }
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.8s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default LoadingScreen;