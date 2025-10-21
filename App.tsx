import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from './hooks/useSettings';
import MainMenu from './components/MainMenu';
import GameScreen from './components/screens/GameScreen';
import SettingsModal from './components/SettingsModal';
import WorldCreatorScreen from './components/screens/WorldCreatorScreen';
import * as GameSaveService from './services/GameSaveService';
import { GameState, WorldCreationState, NovelSession } from './types';
import ConfirmationModal from './components/ui/ConfirmationModal';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import { LATEST_VERSION_NAME } from './services/changelogData';
import LoadingScreen from './components/LoadingScreen';
import ContinueGameModal from './components/ui/ContinueGameModal';
import { migrateFromLocalStorage } from './services/StorageService';
import NovelWriterScreen from './components/screens/NovelWriterScreen';
import NovelLibraryModal from './components/ui/NovelLibraryModal';

type Screen = 'menu' | 'game' | 'world-creator' | 'novel-writer';
type ApiKeyStatus = 'checking' | 'selected' | 'not_selected';

const App: React.FC = () => {
  const settingsHook = useSettings();
  const { isKeyConfigured } = settingsHook;
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameStartData, setGameStartData] = useState<WorldCreationState | GameState | null>(null);
  const [hasManualSave, setHasManualSave] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);
  
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isNovelLibraryModalOpen, setIsNovelLibraryModalOpen] = useState(false);
  const [activeNovelSessionId, setActiveNovelSessionId] = useState<string | null>(null);

  
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('checking');

  useEffect(() => {
    // Simplified API key status check based on settings
    setApiKeyStatus(isKeyConfigured ? 'selected' : 'not_selected');

    migrateFromLocalStorage().then(() => {
      const checkSaves = async () => {
        setHasManualSave(await GameSaveService.hasManualSave());
        setHasAutoSave(await GameSaveService.hasAutoSave());
      };
      checkSaves();
    });

  }, [isKeyConfigured]);

  const handleApiKeyInvalid = useCallback(() => {
    console.warn("API key is invalid or expired. Prompting user to open settings.");
    setApiKeyStatus('not_selected');
    alert("Khóa API của bạn không hợp lệ, đã hết hạn hoặc không có quyền truy cập. Vui lòng kiểm tra và cấu hình lại trong phần Cài đặt.");
    setIsSettingsOpen(true);
  }, []);
  
  const ensureApiKey = () => {
    if (apiKeyStatus !== 'selected') {
      alert("Vui lòng định cấu hình API Key trong phần 'Thiết lập' trước khi bắt đầu.");
      setIsSettingsOpen(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    document.documentElement.style.setProperty('zoom', String(settingsHook.settings.zoomLevel));
  }, [settingsHook.settings.zoomLevel]);

  const startNewGameFlow = () => {
    setGameStartData(null);
    setCurrentScreen('world-creator');
  };

  const handleStartGame = () => {
    if (!ensureApiKey()) return;
    startNewGameFlow();
  };
  
  const handleStartNovelWriter = () => {
    if (!ensureApiKey()) return;
    setIsNovelLibraryModalOpen(true);
  };
  
  const handleStartNewNovelSession = () => {
    const newSessionId = `novel_${Date.now()}`;
    setActiveNovelSessionId(newSessionId);
    setIsNovelLibraryModalOpen(false);
    setCurrentScreen('novel-writer');
  };

  const handleContinueNovelSession = (sessionId: string) => {
      setActiveNovelSessionId(sessionId);
      setIsNovelLibraryModalOpen(false);
      setCurrentScreen('novel-writer');
  };


  const handleContinueManualSave = async () => {
    if (!ensureApiKey()) return;
    const savedGame = await GameSaveService.loadManualSave();
    if (savedGame) {
      setGameStartData(savedGame);
      setCurrentScreen('game');
    } else {
      alert("Không tìm thấy file lưu thủ công nào.");
      setHasManualSave(false);
    }
  };

  const handleContinueAutoSave = async () => {
    if (!ensureApiKey()) return;
    const savedGame = await GameSaveService.loadAutoSave();
    if (savedGame) {
      setGameStartData(savedGame);
      setCurrentScreen('game');
    } else {
      alert("Không tìm thấy file lưu tự động nào.");
      setHasAutoSave(false);
    }
  };

  const handleLoadFromFile = (loadedState: GameState) => {
    if (!ensureApiKey()) return;
    setGameStartData(loadedState);
    setCurrentScreen('game');
  };

  const handleExportSave = async () => {
    const manualSave = await GameSaveService.loadManualSave();
    if (manualSave) {
        GameSaveService.saveToFile(manualSave);
        return;
    }
    const autoSave = await GameSaveService.loadAutoSave();
    if (autoSave) {
        GameSaveService.saveToFile(autoSave);
        return;
    }
    alert("Không có dữ liệu game đã lưu để xuất file.");
  };

  const handleWorldCreated = (state: WorldCreationState) => {
    setGameStartData(state);
    setCurrentScreen('game');
  };

  const handleBackToMenu = async () => {
    setHasManualSave(await GameSaveService.hasManualSave());
    setHasAutoSave(await GameSaveService.hasAutoSave());
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
                  onApiKeyInvalid={handleApiKeyInvalid}
                />;
      case 'novel-writer':
        if (!activeNovelSessionId) {
          // Fallback if somehow screen is reached without data
          setCurrentScreen('menu');
          return null;
        }
        return <NovelWriterScreen 
                  onBackToMenu={() => setCurrentScreen('menu')} 
                  settingsHook={settingsHook}
                  onApiKeyInvalid={handleApiKeyInvalid}
                  sessionId={activeNovelSessionId}
                />;
      case 'game':
        if (!gameStartData) {
          // Fallback if somehow game screen is reached without data
          return <MainMenu
            onStart={handleStartGame}
            onContinue={() => setIsContinueModalOpen(true)}
            onStartNovelWriter={handleStartNovelWriter}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            onShowInfo={() => setIsInfoModalOpen(true)}
            onShowSupport={() => setIsSupportModalOpen(true)}
            onExportSave={handleExportSave}
            continueDisabled={continueDisabled}
            apiKeyStatus={apiKeyStatus}
            versionName={LATEST_VERSION_NAME}
          />;
        }
        return <GameScreen 
                  onBackToMenu={handleBackToMenu} 
                  initialData={gameStartData}
                  settingsHook={settingsHook}
                  openSettings={() => setIsSettingsOpen(true)}
                  onApiKeyInvalid={handleApiKeyInvalid}
               />;
      case 'menu':
      default:
        return (
          <MainMenu
            onStart={handleStartGame}
            onContinue={() => setIsContinueModalOpen(true)}
            onStartNovelWriter={handleStartNovelWriter}
            onLoadFromFile={handleLoadFromFile}
            onSettings={() => setIsSettingsOpen(true)}
            onShowInfo={() => setIsInfoModalOpen(true)}
            onShowSupport={() => setIsSupportModalOpen(true)}
            onExportSave={handleExportSave}
            continueDisabled={continueDisabled}
            apiKeyStatus={apiKeyStatus}
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
          <ContinueGameModal
            isOpen={isContinueModalOpen}
            onClose={() => setIsContinueModalOpen(false)}
            onLoadManual={handleContinueManualSave}
            onLoadAuto={handleContinueAutoSave}
           />
          <NovelLibraryModal
            isOpen={isNovelLibraryModalOpen}
            onClose={() => setIsNovelLibraryModalOpen(false)}
            onStartNew={handleStartNewNovelSession}
            onContinue={handleContinueNovelSession}
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
