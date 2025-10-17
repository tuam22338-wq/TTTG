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
import { LATEST_VERSION_NAME } from './services/changelogData';
import LoadingScreen from './components/LoadingScreen';
import ContinueGameModal from './components/ui/ContinueGameModal';

type Screen = 'menu' | 'game' | 'world-creator';

const App: React.FC = () => {
  const settingsHook = useSettings();
  const { isKeyConfigured } = settingsHook;
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameStartData, setGameStartData] = useState<WorldCreationState | GameState | null>(null);
  const [hasManualSave, setHasManualSave] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);
  
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);


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

  const continueDisabled = !hasManualSave && !hasAutoSave;

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
            onContinue={() => setIsContinueModalOpen(true)}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            onShowInfo={() => setIsInfoModalOpen(true)}
            onShowSupport={() => setIsSupportModalOpen(true)}
            continueDisabled={continueDisabled}
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
            onContinue={() => setIsContinueModalOpen(true)}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            onShowInfo={() => setIsInfoModalOpen(true)}
            onShowSupport={() => setIsSupportModalOpen(true)}
            continueDisabled={continueDisabled}
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
          <ContinueGameModal
            isOpen={isContinueModalOpen}
            onClose={() => setIsContinueModalOpen(false)}
            onLoadManual={handleContinueManualSave}
            onLoadAuto={handleContinueAutoSave}
           />
          <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Thông tin">
            <div className="text-center p-4">
              <p className="text-lg font-semibold text-white">Developer: NGUYEN HOANG TRUONG</p>
            </div>
          </Modal>
          <Modal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} title="Ủng hộ dự án">
            <div className="text-center p-4 space-y-4">
              <p className="text-neutral-300">Nếu có lòng, bạn có thể ủng hộ để dự án tiếp tục phát triển.</p>
              <div className="p-3 bg-black/20 rounded-lg border border-neutral-700">
                <p className="text-sm text-neutral-400">MB BANK</p>
                <p className="text-2xl font-bold font-mono tracking-widest text-white">0337892181</p>
              </div>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default App;
