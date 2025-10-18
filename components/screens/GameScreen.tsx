import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useSettings } from '../../hooks/useSettings';
import { GameState, WorldCreationState, ViewMode, Skill, CharacterStat, Ability, SpecialItem, Equipment, EquipmentSlot, NPC } from '../../types';
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
import CombatScreen from './CombatScreen';
import StatDetailModal from '../game/StatDetailModal';
import StatCreationModal from '../game/StatCreationModal';
import PowerCreationModal from '../game/PowerCreationModal';
import AbilityEditModal from '../game/AbilityEditModal';
import IllustrationBookModal from '../game/achievements/IllustrationBookModal';
import * as GeminiStorytellerService from '../../services/GeminiStorytellerService';
import CodexPanel from '../game/CodexPanel';
import { BookIcon } from '../icons/BookIcon';
import ApiStatusOverlay from '../game/ApiStatusOverlay';


interface GameScreenProps {
  onBackToMenu: () => void;
  initialData: WorldCreationState | GameState;
  settingsHook: ReturnType<typeof useSettings>;
  openSettings: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu, initialData, settingsHook, openSettings }) => {
    const { settings, getApiClient, cycleToNextApiKey, apiStats } = settingsHook;

    const apiClient = useMemo(() => ({
        getApiClient,
        cycleToNextApiKey,
        apiStats
    }), [getApiClient, cycleToNextApiKey]);

    const { 
        gameState, isLoading, error, processTurn, 
        updateAiSettings, newlyAcquiredSkill, handleAcknowledgeSkill, 
        handleDeclineSkill, showIntroductoryModal, setShowIntroductoryModal,
        executeEntityAction, setGameState, addPlayerSkill,
    } = useGameEngine(initialData, apiClient, settings.aiModelSettings, settings.safety);
    
    const [viewMode, setViewMode] = useLocalStorage<ViewMode>('gameViewMode', 'desktop');
    const [customAction, setCustomAction] = useState('');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isCharPanelOpen, setIsCharPanelOpen] = useState(false);
    const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
    const [isCodexOpen, setIsCodexOpen] = useState(false);
    const [isPowerCreationModalOpen, setIsPowerCreationModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStatDetailModalOpen, setIsStatDetailModalOpen] = useState(false);
    const [isCreateStatModalOpen, setIsCreateStatModalOpen] = useState(false);
    const [isAbilityEditModalOpen, setIsAbilityEditModalOpen] = useState(false);
    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);

    const [statDetailData, setStatDetailData] = useState<{ stat: CharacterStat & { name: string }; ownerName: string; ownerType: 'player' | 'npc'; ownerId?: string } | null>(null);
    const [abilityEditData, setAbilityEditData] = useState<{ skillName: string; ability: Ability } | null>(null);
    const [achievementData, setAchievementData] = useState<SpecialItem | null>(null);

    const [usedOneTimeEffectSources, setUsedOneTimeEffectSources] = useState<string[]>([]);
    
    const mainContentRef = useRef<HTMLElement>(null);

    const [currentPage, setCurrentPage] = useState(() => 
      'history' in initialData && initialData.history.length > 0 ? initialData.history.length : 1
    );

    useEffect(() => {
        // Set a specific background for the game screen to ensure it fills the viewport under zoom
        document.body.style.backgroundColor = '#171717'; // Tailwind's neutral-900
        
        // Cleanup function to reset the background when the component unmounts
        return () => {
            document.body.style.backgroundColor = '#0a0a0a'; // Original body color from index.html
        };
    }, []);

    useEffect(() => {
        if (gameState && gameState.history.length > 0 && !isLoading) {
            setCurrentPage(gameState.history.length);
        }
    }, [gameState?.history.length, isLoading]);

    useEffect(() => {
        if (currentPage !== gameState?.history.length) return;
        const element = mainContentRef.current;
        if (element) {
            const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 200;
            if (isScrolledToBottom) {
                setTimeout(() => {
                    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
                }, 100);
            }
        }
    }, [gameState?.history[gameState?.history.length - 1]?.storyText, currentPage, gameState?.history.length]);
    
    const handleChoice = (choice: string) => {
        if (currentPage !== gameState?.history.length) {
            setCurrentPage(gameState.history.length);
        }
        processTurn(choice);
        setCustomAction('');
    };
    
    const handleRewrite = () => {
        if (!gameState) return;
        if (currentPage !== gameState.history.length) {
            setCurrentPage(gameState.history.length);
        }
        processTurn(gameState.history[gameState.history.length - 1].playerAction || "", true);
    }
    
    const handleCorrection = () => {
         if (!gameState || !gameState.history[gameState.history.length - 1].playerAction) return;
         if (currentPage !== gameState.history.length) {
            setCurrentPage(gameState.history.length);
        }
        processTurn(gameState.history[gameState.history.length - 1].playerAction, false, true);
    }

    const handleSave = () => {
        if (gameState) {
            GameSaveService.saveManualSave(gameState);
            setIsGameMenuOpen(false);
        }
    };

    const handleSaveAndExit = () => {
        if (gameState) {
            GameSaveService.saveManualSave(gameState);
        }
        onBackToMenu();
    };
    
    const handleStatClick = (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => {
        setStatDetailData({ stat, ownerName, ownerType, ownerId });
        setIsStatDetailModalOpen(true);
    };
    
    const handleCreatePower = async (data: { name: string, description: string }) => {
        if (!gameState) return;
        setIsSubmitting(true);
        try {
            const newSkill = await GeminiStorytellerService.generateSkillFromUserInput(
                data.name,
                data.description,
                gameState.worldContext,
                apiClient,
                settings.aiModelSettings,
                settings.safety,
            );
            addPlayerSkill(newSkill);
        } catch (e: any) {
            console.error(e);
            alert("Lỗi tạo kỹ năng: " + e.message);
        } finally {
            setIsSubmitting(false);
            setIsPowerCreationModalOpen(false);
        }
    };
    
    const endCombat = (result: 'win' | 'loss' | 'flee', turns: number, finalCombatants: any[]) => {
        if (!gameState) return;
        // This is a simplified end combat logic. A full implementation would update player/NPC stats based on `finalCombatants`.
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                isInCombat: false,
                combatants: [],
            };
        });
        setUsedOneTimeEffectSources([]);
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
    
     if (gameState.isInCombat) {
        return <CombatScreen 
            gameState={gameState} 
            endCombat={endCombat} 
            isLoading={isLoading}
            usedOneTimeEffectSources={usedOneTimeEffectSources}
            onUseOneTimeEffect={(sourceId) => setUsedOneTimeEffectSources(prev => [...prev, sourceId])}
        />
    }
    
    const lastTurn = gameState.history[gameState.history.length - 1];
    const currentTurnForView = gameState.history[currentPage - 1];


    return (
        <>
            <ApiStatusOverlay stats={apiStats} />
            <div className="h-full text-neutral-300 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 bg-black/30 backdrop-blur-sm p-2 flex items-center border-b border-white/10 z-20">
                    <div className="flex-1 flex justify-start items-center gap-2">
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
                         <button onClick={() => setIsCodexOpen(true)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở sổ tay">
                            <BookIcon className="h-6 w-6"/>
                        </button>
                        <button onClick={() => setIsCharPanelOpen(true)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở bảng nhân vật">
                            <UserIcon className="h-6 w-6"/>
                        </button>
                    </div>
                </header>
                
                <main ref={mainContentRef} className="flex-grow flex flex-col p-4 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full">
                       <StoryLog turn={currentTurnForView} />
                    </div>
                </main>

                <footer className="flex-shrink-0 p-4 bg-black/30 z-10">
                    <div className="max-w-7xl mx-auto space-y-2">
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
                            onRequestRewrite={handleRewrite}
                            canCorrect={!!lastTurn.playerAction}
                            onRequestCorrection={handleCorrection}
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
                onStatClick={handleStatClick}
                recentlyUpdatedPlayerStats={new Set()}
                onOpenCreateStatModal={() => setIsCreateStatModalOpen(true)}
                onUseSkill={() => {}} 
                onRequestDeleteSkill={() => {}}
                onRequestEditAbility={(skillName, ability) => { setAbilityEditData({ skillName, ability }); setIsAbilityEditModalOpen(true); }}
                onOpenPowerCreationModal={() => setIsPowerCreationModalOpen(true)}
                isLoading={isLoading}
                onEquipItem={() => {}}
                onUnequipItem={() => {}}
                onShowAchievement={(item) => { setAchievementData(item); setIsAchievementModalOpen(true); }}
            />
            
            <AiControlModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                aiSettings={gameState.aiSettings}
                onSettingsChange={updateAiSettings}
                isLoading={isLoading}
                npcs={gameState.npcs}
                onExecuteEntityAction={executeEntityAction}
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

            <CodexPanel 
                isOpen={isCodexOpen}
                onClose={() => setIsCodexOpen(false)}
                gameState={gameState}
                onUpdateRule={()=>{}}
                onAddRule={()=>{}}
                onDeleteRule={()=>{}}
            />

            <StatDetailModal
                isOpen={isStatDetailModalOpen}
                onClose={() => setIsStatDetailModalOpen(false)}
                stat={statDetailData?.stat || null}
                ownerName={statDetailData?.ownerName || ''}
                onSave={() => {}} // Placeholder
                onDelete={() => {}} // Placeholder
            />
            
            <StatCreationModal 
                isOpen={isCreateStatModalOpen}
                onClose={() => setIsCreateStatModalOpen(false)}
                onSubmit={() => {}} // Placeholder
            />

            <PowerCreationModal
                isOpen={isPowerCreationModalOpen}
                onClose={() => setIsPowerCreationModalOpen(false)}
                onSubmit={handleCreatePower}
                isLoading={isSubmitting}
            />

            <AbilityEditModal
                isOpen={isAbilityEditModalOpen}
                onClose={() => setIsAbilityEditModalOpen(false)}
                abilityData={abilityEditData}
                onSave={() => {}} // Placeholder
                isLoading={isSubmitting}
            />
            
            <IllustrationBookModal 
                isOpen={isAchievementModalOpen}
                onClose={() => setIsAchievementModalOpen(false)}
                item={achievementData}
            />
        </>
    );
};

export default GameScreen;