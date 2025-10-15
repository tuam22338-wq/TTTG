import React, { useState, useEffect } from 'react';
import { GameLogoIcon } from './icons/GameLogoIcon';

interface LoadingScreenProps {
  onFinished: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadingOut(true);
          setTimeout(onFinished, 500); // Wait for fade out animation
          return 100;
        }
        // Simulate a more realistic loading sequence
        let increment = 1;
        if (prev < 20) increment = Math.random() * 3;
        else if (prev < 70) increment = Math.random() * 2;
        else if (prev < 95) increment = Math.random() * 1;
        else increment = 0.5;
        
        return Math.min(prev + increment, 100);
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className={`fixed inset-0 bg-neutral-900 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-8 animate-fade-in-up">
        <GameLogoIcon className="h-32 w-32 md:h-40 md:w-40" />
        <h1 
          className="font-rajdhani text-4xl md:text-5xl font-bold text-white" 
          style={{textShadow: "0 0 8px rgba(255, 255, 255, 0.3), 0 0 20px rgba(192, 132, 252, 0.4)"}}
        >
          Tam Thiên Thế Giới
        </h1>
        <div className="w-80 max-w-[90%] bg-neutral-800 rounded-full h-2.5 shadow-inner">
          <div 
            className="bg-white h-2.5 rounded-full transition-all duration-150 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.7)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white font-mono text-lg">{Math.floor(progress)}%</p>
      </div>
       <style>{`
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
