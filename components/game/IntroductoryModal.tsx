import React from 'react';
import { WorldCreationState } from '../../types';
import Button from '../ui/Button';

interface IntroductoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldContext: WorldCreationState;
  confirmText: string;
}

const IntroductoryModal: React.FC<IntroductoryModalProps> = ({ isOpen, onClose, worldContext, confirmText }) => {
  if (!isOpen) return null;

  const renderTextWithParagraphs = (text: string) => {
    return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start p-4 sm:p-6 md:p-8 animate-fade-in-fast overflow-y-auto">
      <div 
        className="bg-neutral-900 backdrop-blur-xl border-2 border-neutral-700 shadow-2xl rounded-2xl w-full max-w-6xl h-auto md:max-h-[90vh] my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-6 text-center border-b-2 border-neutral-800">
            <h2 className="text-3xl font-bold text-white font-rajdhani tracking-wider theme-h1">
            Sổ Tay Sáng Thế
            </h2>
        </header>
        
        <main className="flex-grow min-h-0 md:grid md:grid-cols-2 md:gap-x-8 p-6 space-y-6 md:space-y-0">
          {/* World Description Column */}
          <section className="flex flex-col md:min-h-0">
            <h3 className="text-2xl font-semibold text-white mb-3 flex-shrink-0">Mô Tả Thế Giới</h3>
            <div className="text-lg leading-relaxed text-neutral-300 md:flex-grow md:overflow-y-auto pr-3 custom-scrollbar">
              {renderTextWithParagraphs(worldContext.description)}
            </div>
          </section>

           {/* Character Bio Column */}
          <section className="flex flex-col md:min-h-0">
            <h3 className="text-2xl font-semibold text-white mb-3 flex-shrink-0">Tiểu Sử: {worldContext.character.name}</h3>
             <div className="text-lg leading-relaxed text-neutral-300 md:flex-grow md:overflow-y-auto pr-3 custom-scrollbar">
              {renderTextWithParagraphs(worldContext.character.biography)}
            </div>
          </section>
        </main>

        <footer className="p-6 border-t-2 border-neutral-800 flex-shrink-0 bg-black/20">
          <Button onClick={onClose} variant="primary" className="w-full max-w-sm mx-auto flex justify-center">
            {confirmText}
          </Button>
        </footer>
      </div>
       <style>{`
        .theme-h1 { text-shadow: 0 0 12px rgba(255, 255, 255, 0.5); }
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #555 #171717;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #555;
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: content-box;
        }
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default IntroductoryModal;