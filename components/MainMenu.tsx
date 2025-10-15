
import React, { useState, useEffect, useMemo } from 'react';
import { GameState } from '../types';
import * as GameSaveService from '../services/GameSaveService';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { ContinueIcon } from './icons/ContinueIcon';
import { UploadIcon } from './icons/UploadIcon';
import { BookIcon } from './icons/BookIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CogIcon } from './icons/CogIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { KeyIcon } from './icons/KeyIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { GameLogoIcon } from './icons/GameLogoIcon';


interface MainMenuProps {
  onStart: () => void;
  onContinueManualSave: () => void;
  onContinueAutoSave: () => void;
  onSettings: () => void;
  onShowChangelog: () => void;
  onLoadFromFile: (state: GameState) => void;
  manualSaveDisabled: boolean;
  autoSaveDisabled: boolean;
  isKeyConfigured: boolean;
  versionName: string;
}

const MainMenu: React.FC<MainMenuProps> = ({ 
    onStart, 
    onContinueManualSave, 
    onContinueAutoSave, 
    onLoadFromFile, 
    onSettings, 
    onShowChangelog,
    manualSaveDisabled, 
    autoSaveDisabled,
    isKeyConfigured,
    versionName
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const gameState = await GameSaveService.loadFromFile(file);
        onLoadFromFile(gameState);
      } catch (error: any) {
        alert(error.message || "Không thể tải file save.");
      } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  const triggerFileLoad = () => {
    fileInputRef.current?.click();
  };
  
  const handleOpenGuide = () => {
    const guideUrl = 'https://docs.google.com/document/d/1xqN7Qmy7XV3X7P0wNjHsZcN-6kxHnPXi-c-FXT5cfuM/edit?tab=t.0';
    window.open(guideUrl, '_blank', 'noopener,noreferrer');
  };

  const menuItems = [
    { id: 'start', label: 'Bắt đầu Game Mới', description: 'Tạo một thế giới và nhân vật mới từ đầu.', action: onStart, disabled: false, Icon: PlusCircleIcon },
    { id: 'continueManual', label: 'Tiếp tục (Lưu & Thoát)', description: 'Tải lại từ điểm bạn đã chủ động lưu và thoát.', action: onContinueManualSave, disabled: manualSaveDisabled, Icon: ContinueIcon },
    { id: 'continueAuto', label: 'Tiếp tục (Lưu tự động)', description: 'Tải lại từ lượt đi cuối cùng của bạn.', action: onContinueAutoSave, disabled: autoSaveDisabled, Icon: ContinueIcon },
    { id: 'load', label: 'Tải game từ file', description: 'Tải một file save (.json) từ máy tính của bạn.', action: triggerFileLoad, disabled: false, Icon: UploadIcon },
    { id: 'guide', label: 'Hướng dẫn', description: 'Mở tài liệu hướng dẫn chi tiết về cách chơi.', action: handleOpenGuide, disabled: false, Icon: BookIcon },
    { id: 'changelog', label: 'Thông Tin Cập nhật', description: 'Xem các tính năng và sửa lỗi mới nhất.', action: onShowChangelog, disabled: false, Icon: InfoIcon },
    { id: 'settings', label: 'Thiết lập', description: 'Tùy chỉnh khóa API, model AI và các cài đặt khác.', action: onSettings, disabled: false, Icon: CogIcon },
  ];

  const storageStatusText = useMemo(() => {
    const hasManual = !manualSaveDisabled;
    const hasAuto = !autoSaveDisabled;
    if (hasManual && hasAuto) return 'Thủ công & Tự động';
    if (hasManual) return 'Chỉ có Thủ công';
    if (hasAuto) return 'Chỉ có Tự động';
    return 'Trống';
  }, [manualSaveDisabled, autoSaveDisabled]);


  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
       <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      
       <div className={`text-center mb-12 transition-all duration-700 ease-out ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
          <div className="inline-flex items-center justify-center flex-col gap-4">
              <GameLogoIcon className="h-24 w-24 sm:h-28 sm:w-28" />
              <h1 className="font-rajdhani text-5xl sm:text-6xl font-bold text-white" style={{textShadow: "0 0 10px rgba(255, 255, 255, 0.4), 0 0 25px rgba(192, 132, 252, 0.5)"}}>
                  Tam Thiên Thế Giới
              </h1>
          </div>
       </div>

       <div className={`main-panel ${isReady ? 'ready' : ''} relative z-10 w-full max-w-2xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col`}>
            <div className="p-8">
                <div className="w-full space-y-3">
                    {menuItems.map((item, index) => (
                        <button 
                            key={item.id}
                            onClick={item.action}
                            disabled={item.disabled}
                            className={`menu-item-container ${isReady ? 'ready' : ''} w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group border border-transparent ${!item.disabled && 'hover:bg-white/5 hover:border-white/20'}`}
                            style={{ transitionDelay: `${100 + index * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                    <item.Icon className="h-6 w-6 text-neutral-400 group-hover:text-white transition-colors"/>
                                </div>
                                <div className="flex-grow text-left">
                                    <p className="font-bold text-lg text-neutral-100">{item.label}</p>
                                    <p className="text-sm text-neutral-400">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-500 transition-transform duration-300 group-hover:text-white group-hover:translate-x-1">
                                <ChevronRightIcon className="h-6 w-6" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <footer className="w-full mt-2 p-6 border-t border-white/10 bg-black/20 rounded-b-3xl flex justify-between items-start text-xs text-neutral-500">
                <div className="flex items-center gap-3">
                    <KeyIcon className="h-6 w-6 text-neutral-600"/>
                    <div>
                        <p className="font-bold uppercase">API KEY</p>
                        <p className={`font-semibold ${isKeyConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
                            {isKeyConfigured ? 'Đã định cấu hình' : 'Chưa định cấu hình'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                     <div>
                        <p className="font-bold uppercase">LƯU TRỮ (LOCALSTORAGE)</p>
                        <p className="font-semibold text-white">{storageStatusText}</p>
                    </div>
                    <DatabaseIcon className="h-6 w-6 text-neutral-600"/>
                </div>
            </footer>

       </div>

      {versionName && (
        <div className="fixed bottom-4 right-4 text-xs text-neutral-400 font-mono z-20">
          {versionName}
        </div>
      )}

      <style>{`
        .main-panel {
          opacity: 0;
          transform: scale(0.95) translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .main-panel.ready {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        
        .menu-item-container {
            opacity: 0;
            transform: translateX(20px);
            transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        }
        .menu-item-container.ready {
             opacity: 1;
            transform: translateX(0);
        }
      `}</style>
    </div>
  );
};

export default MainMenu;
