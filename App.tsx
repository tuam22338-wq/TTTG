import React, { useState, useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import MainMenu from './components/MainMenu';
import GameScreen from './components/screens/GameScreen';
import SettingsModal from './components/SettingsModal';
import WorldCreatorScreen from './components/screens/WorldCreatorScreen';
import * as GameSaveService from './services/GameSaveService';
import { GameState, WorldCreationState } from './types';
import ConfirmationModal from './components/ui/ConfirmationModal';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import { changelogHistory, LATEST_VERSION_NAME } from './services/changelogData';
import LoadingScreen from './components/LoadingScreen';

type Screen = 'menu' | 'game' | 'world-creator';

const App: React.FC = () => {
  const settingsHook = useSettings();
  const { isKeyConfigured } = settingsHook;
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameStartData, setGameStartData] = useState<WorldCreationState | GameState | null>(null);
  const [hasManualSave, setHasManualSave] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);

  useEffect(() => {
    setHasManualSave(GameSaveService.hasManualSave());
    setHasAutoSave(GameSaveService.hasAutoSave());
    if (!isKeyConfigured && !localStorage.getItem('appSettings')) {
      setIsSettingsOpen(true);
    }
  }, [isKeyConfigured]);

  useEffect(() => {
    document.documentElement.style.setProperty('zoom', String(settingsHook.settings.zoomLevel));
  }, [settingsHook.settings.zoomLevel]);

  const startNewGameFlow = () => {
    setGameStartData(null);
    setCurrentScreen('world-creator');
  };

  const handleStartGame = () => {
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }
    if (GameSaveService.hasManualSave() || GameSaveService.hasAutoSave()) {
      setIsNewGameConfirmOpen(true);
    } else {
      startNewGameFlow();
    }
  };
  
  const handleConfirmStartNewGame = () => {
    GameSaveService.deleteAllLocalSaves();
    setHasManualSave(false);
    setHasAutoSave(false);
    setIsNewGameConfirmOpen(false);
    startNewGameFlow();
  };
  
  const handleContinueManualSave = () => {
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }
    const savedGame = GameSaveService.loadManualSave();
    if (savedGame) {
      setGameStartData(savedGame);
      setCurrentScreen('game');
    } else {
      alert("Không tìm thấy file lưu thủ công nào.");
      setHasManualSave(false);
    }
  };

  const handleContinueAutoSave = () => {
    if (!isKeyConfigured) {
      setIsSettingsOpen(true);
      return;
    }
    const savedGame = GameSaveService.loadAutoSave();
    if (savedGame) {
      setGameStartData(savedGame);
      setCurrentScreen('game');
    } else {
      alert("Không tìm thấy file lưu tự động nào.");
      setHasAutoSave(false);
    }
  };

  const handleLoadFromFile = (loadedState: GameState) => {
    if (!isKeyConfigured) {
        setIsSettingsOpen(true);
        return;
    }
    setGameStartData(loadedState);
    setCurrentScreen('game');
  };

  const handleWorldCreated = (state: WorldCreationState) => {
    setGameStartData(state);
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setHasManualSave(GameSaveService.hasManualSave());
    setHasAutoSave(GameSaveService.hasAutoSave());
    setCurrentScreen('menu');
  };


  const renderScreen = () => {
    switch (currentScreen) {
      case 'world-creator':
        return <WorldCreatorScreen 
                  onBackToMenu={() => setCurrentScreen('menu')} 
                  onWorldCreated={handleWorldCreated}
                  settingsHook={settingsHook}
                />;
      case 'game':
        if (!gameStartData) {
          // Fallback if somehow game screen is reached without data
          return <MainMenu
            onStart={handleStartGame}
            onContinueManualSave={handleContinueManualSave}
            onContinueAutoSave={handleContinueAutoSave}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            onShowChangelog={() => setIsChangelogOpen(true)}
            manualSaveDisabled={!hasManualSave}
            autoSaveDisabled={!hasAutoSave}
            isKeyConfigured={isKeyConfigured}
            versionName={LATEST_VERSION_NAME}
          />;
        }
        return <GameScreen 
                  onBackToMenu={handleBackToMenu} 
                  initialData={gameStartData}
                  settingsHook={settingsHook}
                  openSettings={() => setIsSettingsOpen(true)}
               />;
      case 'menu':
      default:
        return (
          <MainMenu
            onStart={handleStartGame}
            onContinueManualSave={handleContinueManualSave}
            onContinueAutoSave={handleContinueAutoSave}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            onShowChangelog={() => setIsChangelogOpen(true)}
            manualSaveDisabled={!hasManualSave}
            autoSaveDisabled={!hasAutoSave}
            isKeyConfigured={isKeyConfigured}
            versionName={LATEST_VERSION_NAME}
          />
        );
    }
  };

  return (
    <>
      {isAppLoading ? (
        <LoadingScreen onFinished={() => setIsAppLoading(false)} />
      ) : (
        <>
          {renderScreen()}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settingsHook={settingsHook}
          />
          <ConfirmationModal
            isOpen={isNewGameConfirmOpen}
            onClose={() => setIsNewGameConfirmOpen(false)}
            onConfirm={handleConfirmStartNewGame}
            title="Xác nhận Hành động"
            confirmText="Xóa và Bắt đầu"
            cancelText="Hủy"
          >
            <p>Hành động này sẽ xóa vĩnh viễn các file lưu thủ công và tự động hiện tại.</p>
            <p className="font-bold mt-2">Bạn có chắc chắn muốn tiếp tục không?</p>
          </ConfirmationModal>
          <Modal
            isOpen={isChangelogOpen}
            onClose={() => setIsChangelogOpen(false)}
            title="Thông Tin Cập Nhật"
          >
            <div className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto pr-3 space-y-6 custom-scrollbar">
                {changelogHistory.map((versionData, index) => (
                  <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                    <div className="flex justify-between items-baseline pb-2 mb-3 border-b border-[#e02585]/40">
                      <h3 className="text-xl font-bold text-[#e02585] tracking-wider" style={{ textShadow: '0 0 5px rgba(224, 37, 133, 0.7)' }}>
                        {versionData.version}
                      </h3>
                      {versionData.date && <span className="text-sm text-[#a08cb6] font-mono">{versionData.date}</span>}
                    </div>
                    <ul className="list-none space-y-2 pl-2">
                      {versionData.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="flex items-start">
                          <span className="text-[#e02585] mr-2 mt-1 flex-shrink-0">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Button onClick={() => setIsChangelogOpen(false)} variant="secondary" className="w-full">
                    Đóng
                </Button>
              </div>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #633aab; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #e02585; }
                 @keyframes fade-in-up {
                  from { opacity: 0; transform: translateY(15px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                  opacity: 0;
                  animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
          </Modal>
        </>
      )}
    </>
  );
};

export default App;