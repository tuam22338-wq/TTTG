import React, { useState, useEffect, useCallback } from 'react';
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
import { migrateFromLocalStorage } from './services/StorageService';
import NovelWriterScreen from './components/screens/NovelWriterScreen';

type Screen = 'menu' | 'game' | 'world-creator' | 'novel-writer';
type ApiKeyStatus = 'checking' | 'selected' | 'not_selected';

// Define the modal component directly inside App.tsx
const ApiKeySelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectKey: () => void;
}> = ({ isOpen, onClose, onSelectKey }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yêu cầu API Key">
      <div className="text-center p-4 space-y-4">
        <p className="text-neutral-300">
          Để sử dụng các tính năng AI của ứng dụng, bạn cần cung cấp API key của riêng mình.
          Việc này đảm bảo bạn có toàn quyền kiểm soát việc sử dụng và chi phí.
        </p>
        <p className="text-neutral-400 text-sm">
          Bạn có thể lấy API Key từ Google AI Studio. Vui lòng đảm bảo bạn đã bật thanh toán cho dự án của mình.
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 underline ml-1"
          >
            Tìm hiểu thêm về thanh toán.
          </a>
        </p>
        <div className="pt-4">
          <Button onClick={onSelectKey} variant="primary">
            Chọn hoặc Cung cấp API Key
          </Button>
        </div>
      </div>
    </Modal>
  );
};


const App: React.FC = () => {
  const settingsHook = useSettings();
  const { isKeyConfigured } = settingsHook; // Keep this for non-aistudio environments
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameStartData, setGameStartData] = useState<WorldCreationState | GameState | null>(null);
  const [hasManualSave, setHasManualSave] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);
  
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('checking');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);


  useEffect(() => {
    const checkApiKey = async () => {
      // The `window.aistudio` object might not exist in all environments.
      if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeyStatus(hasKey ? 'selected' : 'not_selected');
      } else {
        // Fallback for environments without the aistudio object, rely on old logic.
        setApiKeyStatus(isKeyConfigured ? 'selected' : 'not_selected');
      }
    };
    checkApiKey();

    migrateFromLocalStorage().then(() => {
      const checkSaves = async () => {
        setHasManualSave(await GameSaveService.hasManualSave());
        setHasAutoSave(await GameSaveService.hasAutoSave());
      };
      checkSaves();
    });

  }, [isKeyConfigured]);

  const handleApiKeyInvalid = useCallback(() => {
    console.warn("API key is invalid or expired. Prompting user to select a new one.");
    setApiKeyStatus('not_selected');
    setIsApiKeyModalOpen(true);
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      // Optimistically set status to selected as per guidelines
      setApiKeyStatus('selected');
      setIsApiKeyModalOpen(false);
    } else {
      // Fallback for other environments
      setIsSettingsOpen(true);
      setIsApiKeyModalOpen(false);
    }
  };
  
  const ensureApiKey = () => {
    if (apiKeyStatus !== 'selected') {
      setIsApiKeyModalOpen(true);
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
        return <NovelWriterScreen 
                  onBackToMenu={() => setCurrentScreen('menu')} 
                  settingsHook={settingsHook}
                  onApiKeyInvalid={handleApiKeyInvalid}
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
          <ApiKeySelectionModal
            isOpen={isApiKeyModalOpen}
            onClose={() => setIsApiKeyModalOpen(false)}
            onSelectKey={handleSelectKey}
          />
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