import React from 'react';
import Modal from '../ui/Modal';
import { ContinueIcon } from '../icons/ContinueIcon';
import { SaveIcon, SaveExitIcon, ExitIcon } from '../icons/MenuActionIcons';
import { CogIcon } from '../icons/CogIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface InGameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onSaveAndExit: () => void;
  onSettings: () => void;
  onExitWithoutSaving: () => void;
}

const InGameMenuModal: React.FC<InGameMenuModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveAndExit,
  onSettings,
  onExitWithoutSaving,
}) => {
  const menuItems = [
    { id: 'continue', label: 'Tiếp tục', action: onClose, Icon: ContinueIcon },
    { id: 'save', label: 'Lưu Game', action: onSave, Icon: SaveIcon },
    { id: 'save_exit', label: 'Lưu và Thoát', action: onSaveAndExit, Icon: SaveExitIcon },
    { id: 'settings', label: 'Cài đặt', action: onSettings, Icon: CogIcon },
    { id: 'exit', label: 'Thoát (Không lưu)', action: onExitWithoutSaving, Icon: ExitIcon },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
        <div 
            className="w-full max-w-sm bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6">
                <h2 className="text-2xl font-bold text-center text-white font-rajdhani mb-6">Menu</h2>
                <div className="space-y-3">
                    {menuItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group border border-transparent hover:bg-white/5 hover:border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black/20 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                    <item.Icon className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors"/>
                                </div>
                                <div className="flex-grow text-left">
                                    <p className="font-semibold text-base text-neutral-100">{item.label}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-500 transition-transform duration-300 group-hover:text-white group-hover:translate-x-1">
                                <ChevronRightIcon className="h-5 w-5" />
                            </div>
                        </button>
                    ))}
                </div>
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
        `}</style>
    </div>
  );
};

export default InGameMenuModal;
