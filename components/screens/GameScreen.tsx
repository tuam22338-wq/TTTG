import React, { useState, useEffect, useMemo } from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useSettings } from '../../hooks/useSettings';
import { GameState, WorldCreationState, ViewMode } from '../../types';
import StoryLog from '../game/StoryLog';
import ChoiceBox from '../game/ChoiceBox';
import CharacterPanel from '../game/CharacterPanel';
import AiControlModal from '../game/AiControlModal';
import GameClock from '../game/GameClock';
import TokenCounter from '../game/TokenCounter';
import RequestCounter from '../game/RequestCounter';
import ViewModeToggle from '../game/ViewModeToggle';
import IntroductoryModal from '../game/IntroductoryModal';
import SkillAcquisitionModal from '../game/SkillAcquisitionModal';
import * as GameSaveService from '../../services/GameSaveService';
import useLocalStorage from '../../hooks/useLocalStorage';
import Button from '../ui/Button';
import PaginationControls from '../game/PaginationControls';
import InGameMenuModal from '../game/InGameMenuModal';
import { MenuIcon } from '../icons/MenuActionIcons';
import { UserIcon } from '../icons/UserIcon';


interface GameScreenProps {
  onBackToMenu: () => void;
  initialData: WorldCreationState | GameState;
  settingsHook: ReturnType<typeof useSettings>;
  openSettings: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu, initialData, settingsHook, openSettings }) => {
    const { settings } = settingsHook;
    const { 
        gameState, isLoading, error, processTurn, 
        updateAiSettings, newlyAcquiredSkill, handleAcknowledgeSkill, 
        handleDeclineSkill, showIntroductoryModal, setShowIntroductoryModal
    } = useGameEngine(initialData, settingsHook.geminiService, settings.aiModelSettings, settings.safety);
    
    const [viewMode, setViewMode] = useLocalStorage<ViewMode>('gameViewMode', 'desktop');
    const [customAction, setCustomAction] = useState('');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isCharPanelOpen, setIsCharPanelOpen] = useState(false);
    const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(() => 
      'history' in initialData && initialData.history.length > 0 ? initialData.history.length : 1
    );

    useEffect(() => {
        if (gameState && gameState.history.length > 0) {
            setCurrentPage(gameState.history.length);
        }
    }, [gameState?.history.length]);
    
    const handleChoice = (choice: string) => {
        processTurn(choice);
        setCustomAction('');
    };

    const handleSave = () => {
        if (gameState) {
            GameSaveService.saveManualSave(gameState);
            console.log("Game saved manually!");
            setIsGameMenuOpen(false);
        }
    };

    const handleSaveAndExit = () => {
        if (gameState) {
            GameSaveService.saveManualSave(gameState);
        }
        onBackToMenu();
    };

    const totalPages = gameState ? gameState.history.length : 1;
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleJumpToPage = (page: number) => {
        const pageNum = Math.max(1, Math.min(totalPages, page));
        setCurrentPage(pageNum);
    };
    
    if (isLoading && !gameState) {
        return <div className="flex items-center justify-center h-screen bg-black text-white text-2xl animate-pulse">Đang sáng tạo thế giới...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-red-900/50 text-white p-8">
                <h2 className="text-3xl font-bold text-red-300 mb-4">Đã xảy ra lỗi nghiêm trọng</h2>
                <pre className="bg-black/50 p-4 rounded-md text-red-200 whitespace-pre-wrap w-full max-w-2xl">{error}</pre>
                <Button onClick={onBackToMenu} variant="secondary" className="mt-8">Quay lại Menu</Button>
            </div>
        );
    }
    
    if (!gameState) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">Lỗi: Không thể tải trạng thái game.</div>;
    }
    
    const lastTurn = gameState.history[gameState.history.length - 1];
    const currentTurnForView = gameState.history[currentPage - 1];


    return (
        <>
            <div className="h-screen bg-neutral-900 text-neutral-300 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex-shrink-0 bg-black/30 backdrop-blur-sm p-2 flex items-center border-b border-white/10 z-20">
                    <div className="flex-1 flex justify-start">
                        <button onClick={() => setIsGameMenuOpen(true)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở menu">
                            <MenuIcon />
                        </button>
                    </div>
                    <div className="flex-shrink-0">
                        <GameClock time={gameState.time} />
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <TokenCounter lastTurn={lastTurn.tokenCount || 0} total={gameState.totalTokens} />
                        <RequestCounter count={gameState.requestCount} />
                        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} disabled={isLoading} />
                        <button onClick={() => setIsCharPanelOpen(true)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở bảng nhân vật">
                            <UserIcon className="h-6 w-6"/>
                        </button>
                    </div>
                </header>
                
                {/* Main Content */}
                <main className="flex-grow flex flex-col p-4 overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto w-full">
                       <StoryLog turn={currentTurnForView} />
                    </div>
                </main>

                {/* Footer / Action Panel */}
                <footer className="flex-shrink-0 p-4 bg-black/30 z-10">
                    <div className="max-w-4xl mx-auto space-y-2">
                       {gameState.history.length > 0 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPrev={handlePrevPage}
                                onNext={handleNextPage}
                                onJump={handleJumpToPage}
                            />
                       )}
                        <ChoiceBox
                            choices={lastTurn.choices}
                            onChoice={handleChoice}
                            isLoading={isLoading}
                            aiSettings={gameState.aiSettings}
                            customAction={customAction}
                            onCustomActionChange={setCustomAction}
                            onOpenAiControlModal={() => setIsAiModalOpen(true)}
                            canRewrite={gameState.history.length > 0}
                            onRequestRewrite={() => processTurn(lastTurn.playerAction || "", true)}
                            canCorrect={!!lastTurn.playerAction}
                            onRequestCorrection={() => processTurn(lastTurn.playerAction || "", false, true)}
                        />
                    </div>
                </footer>
            </div>
            
             <IntroductoryModal 
                isOpen={showIntroductoryModal}
                onClose={() => setShowIntroductoryModal(false)}
                worldContext={gameState.worldContext}
                confirmText="Bắt đầu cuộc hành trình"
            />

            <SkillAcquisitionModal 
                isOpen={!!newlyAcquiredSkill}
                skill={newlyAcquiredSkill}
                onConfirm={handleAcknowledgeSkill}
                onDecline={handleDeclineSkill}
            />

            <CharacterPanel 
                isOpen={isCharPanelOpen}
                onClose={() => setIsCharPanelOpen(false)}
                gameState={gameState}
                finalCoreStats={gameState.coreStats}
                onStatClick={() => {}} // Placeholder
                recentlyUpdatedPlayerStats={new Set()} // Placeholder
                onOpenCreateStatModal={() => {}} // Placeholder
                onUseSkill={() => {}} // Placeholder
                onRequestDeleteSkill={() => {}} // Placeholder
                onRequestEditAbility={() => {}} // Placeholder
                onOpenPowerCreationModal={() => {}} // Placeholder
                isLoading={isLoading}
                onEquipItem={() => {}} // Placeholder
                onUnequipItem={() => {}} // Placeholder
                onShowAchievement={() => {}} // Placeholder
            />
            
            <AiControlModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                aiSettings={gameState.aiSettings}
                onSettingsChange={updateAiSettings}
                isLoading={isLoading}
                npcs={gameState.npcs}
                onExecuteEntityAction={() => {}} // Placeholder
            />

            <InGameMenuModal
                isOpen={isGameMenuOpen}
                onClose={() => setIsGameMenuOpen(false)}
                onSave={handleSave}
                onSaveAndExit={handleSaveAndExit}
                onSettings={() => {
                    setIsGameMenuOpen(false);
                    openSettings();
                }}
                onExitWithoutSaving={onBackToMenu}
            />
        </>
    );
};

export default GameScreen;