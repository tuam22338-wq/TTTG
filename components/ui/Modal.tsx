import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'lg' | 'xl' | '2xl';
  hideHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg', hideHeader = false }) => {
  if (!isOpen) return null;

  const sizeClass = {
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[size];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start sm:items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`neumorphic-convex w-full ${sizeClass} mx-auto my-auto rounded-2xl transform transition-all duration-300 ease-out scale-95 animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white font-rajdhani">{title}</h2>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors rounded-full p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-white/80"
              aria-label="Đóng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="modal-content-container">
          {children}
        </div>
      </div>
       <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        .modal-content-container {
          padding: 1.5rem; /* Equivalent to p-6 */
        }
        .modal-content-container:has(.flex.flex-col) {
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Modal;