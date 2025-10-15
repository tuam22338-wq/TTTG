
import React, { useState } from 'react';
import { SpecialItem } from '../../../types';
import Button from '../../ui/Button';

interface IllustrationBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SpecialItem | null;
}

const EyeIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        {isOpen ? (
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        ) : (
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        )}
        <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);


const IllustrationBookModal: React.FC<IllustrationBookModalProps> = ({ isOpen, onClose, item }) => {
  const [isLoreVisible, setIsLoreVisible] = useState(true);

  if (!isOpen || !item || !item.isAchievement) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose}
    >
        <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Background Image */}
            <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 rounded-lg"></div>

            {/* Lore Box */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl transition-all duration-500 ease-in-out ${isLoreVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-black/70 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg">
                    <h2 className="text-3xl font-bold text-amber-300 font-rajdhani mb-2" style={{textShadow: '0 0 8px rgba(251, 191, 36, 0.6)'}}>
                        {item.name}
                    </h2>
                    <p className="text-base leading-relaxed text-gray-200">
                        {item.loreText}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                 <button 
                    onClick={() => setIsLoreVisible(!isLoreVisible)}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
                    title={isLoreVisible ? "Ẩn nội dung" : "Hiện nội dung"}
                >
                    <EyeIcon isOpen={!isLoreVisible} />
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors"
                    title="Đóng"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default IllustrationBookModal;
