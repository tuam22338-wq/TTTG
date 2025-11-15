import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useSettings } from '../../hooks/useSettings';
import { GameState, WorldCreationState, ViewMode, Skill, CharacterStat, Ability, SpecialItem, Equipment, EquipmentSlot, NPC } from '../../types';
import StoryLog from '../game/StoryLog';
import ChoiceBox from '../game/ChoiceBox';
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
import AbilityEditModal from '../game/AbilityEditModal';
import IllustrationBookModal from '../game/achievements/IllustrationBookModal';
import CodexPanel from '../game/CodexPanel';
import { BookIcon } from '../icons/BookIcon';
import ApiStatusOverlay from '../game/ApiStatusOverlay';
import { TriggerIcon } from '../icons/TriggerIcon';
import NotificationToast from '../ui/NotificationToast';
import TriggerPanel from '../game/triggers/TriggerPanel';
import FeedbackButtons from '../game/FeedbackButtons';
import CharacterSheet from '../game/CharacterSheet';
import EquipmentAndInventoryPanel from '../game/EquipmentAndInventoryPanel';
import ChevronIcon from '../icons/ChevronIcon';
import { PackageIcon } from '../icons/PackageIcon';


interface GameScreenProps {
  onBackToMenu: () => void;
  initialData: WorldCreationState | GameState;
  settingsHook: ReturnType<typeof useSettings>;
  openSettings: () => void;
  onApiKeyInvalid: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu, initialData, settingsHook, openSettings, onApiKeyInvalid }) => {
    const { settings, getApiClient, cycleToNextApiKey, apiStats } = settingsHook;

    const apiClient = useMemo(() => ({
        getApiClient,
        cycleToNextApiKey,
        apiStats,
        onApiKeyInvalid
    }), [getApiClient, cycleToNextApiKey, apiStats, onApiKeyInvalid]);

    const { 
        gameState, isLoading, error, processTurn, 
        updateAiSettings, newlyAcquiredSkill, handleAcknowledgeSkill, 
        handleDeclineSkill, showIntroductoryModal, setShowIntroductoryModal,
        executeEntityAction, setGameState, addPlayerSkill, setError,
        addNarrativeEvent,
    } = useGameEngine(initialData, apiClient, settings);
    
    const [viewMode, setViewMode] = useLocalStorage<ViewMode>('gameViewMode', 'desktop');
    const [customAction, setCustomAction] = useState('');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
    const [isCodexOpen, setIsCodexOpen] = useState(false);
    const [isAutomationPanelOpen, setIsAutomationPanelOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStatDetailModalOpen, setIsStatDetailModalOpen] = useState(false);
    const [isCreateStatModalOpen, setIsCreateStatModalOpen] = useState(false);
    const [isAbilityEditModalOpen, setIsAbilityEditModalOpen] = useState(false);
    const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Array<{id: number, message: string}>>([]);
    
    const [isCharacterSectionOpen, setIsCharacterSectionOpen] = useState(false);
    const [isInventorySectionOpen, setIsInventorySectionOpen] = useState(false);

    const [statDetailData, setStatDetailData] = useState<any>(null);
    const [abilityEditData, setAbilityEditData] = useState<any>(null);
    const [achievementData, setAchievementData] = useState<any>(null);

    const [usedOneTimeEffectSources, setUsedOneTimeEffectSources] = useState<string[]>([]);
    
    const mainContentRef = useRef<HTMLElement>(null);
    const characterSectionRef = useRef<HTMLDivElement>(null);
    const inventorySectionRef = useRef<HTMLDivElement>(null);


    const [currentPage, setCurrentPage] = useState(() => 
      'history' in initialData && initialData.history.length > 0 ? initialData.history.length : 1
    );
    
     const handleToggleSection = (
        setOpen: React.Dispatch<React.SetStateAction<boolean>>,
        ref: React.RefObject<HTMLDivElement>
    ) => {
        setOpen(prev => {
            const isOpen = !prev;
            if (isOpen && ref.current) {
                setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }
            return isOpen;
        });
    };

    useEffect(() => {
        if (gameState?.pendingNotifications && gameState.pendingNotifications.length > 0) {
            const newNotifications = gameState.pendingNotifications.map(msg => ({ id: Date.now() + Math.random(), message: msg }));
            setNotifications(prev => [...prev, ...newNotifications]);
            setGameState(prev => prev ? ({ ...prev, pendingNotifications: [] }) : null);
        }
    }, [gameState?.pendingNotifications, setGameState]);

    const dismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

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
    
    const handleStatClick = (stat: any, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => {
        setStatDetailData({ stat, ownerName, ownerType, ownerId });
        setIsStatDetailModalOpen(true);
    };

    const handleSaveStat = (oldStatName: string, newStatData: any, ownerType: 'player' | 'npc', ownerId?: string) => {
        setGameState(prev => {
            if (!prev) return null;
            let newState = { ...prev };
    
            const updateStats = (stats: any, order: string[]): { newStats: any, newOrder: string[] } => {
                const newStats = { ...stats };
                delete newStats[oldStatName];
                const { name, ...restOfStatData } = newStatData;
                newStats[name] = restOfStatData;
                
                const newOrder = order.map(n => n === oldStatName ? name : n);
                if (!newOrder.includes(name)) {
                     const oldIndex = order.indexOf(oldStatName);
                     if (oldIndex > -1) {
                         newOrder.splice(oldIndex, 0, name);
                     } else {
                         newOrder.push(name);
                     }
                }
    
                return { newStats, newOrder };
            };
    
            if (ownerType === 'player') {
                const { newStats, newOrder } = updateStats(newState.playerStats, newState.playerStatOrder);
                newState.playerStats = newStats;
                newState.playerStatOrder = newOrder;
            } else if (ownerType === 'npc' && ownerId) {
                const npcIndex = newState.npcs.findIndex(n => n.id === ownerId);
                if (npcIndex !== -1) {
                    const { newStats } = updateStats(newState.npcs[npcIndex].stats, []);
                    newState.npcs[npcIndex] = { ...newState.npcs[npcIndex], stats: newStats };
                }
            }
            return newState;
        });
        addNarrativeEvent(`Tác giả đã chỉnh sửa trạng thái '${oldStatName}' thành '${newStatData.name}' cho ${ownerType === 'player' ? 'người chơi' : `NPC ${statDetailData?.ownerName}`}.`);
        setIsStatDetailModalOpen(false);
    };
    
    const handleDeleteStat = (statName: string, ownerType: 'player' | 'npc', ownerId?: string) => {
        setGameState(prev => {
            if (!prev) return null;
            let newState = { ...prev };
    
            if (ownerType === 'player') {
                const newStats = { ...newState.playerStats };
                delete newStats[statName];
                newState.playerStats = newStats;
                newState.playerStatOrder = newState.playerStatOrder.filter(name => name !== statName);
            } else if (ownerType === 'npc' && ownerId) {
                const npcIndex = newState.npcs.findIndex(n => n.id === ownerId);
                if (npcIndex !== -1) {
                    const newStats = { ...newState.npcs[npcIndex].stats };
                    delete newStats[statName];
                    newState.npcs[npcIndex] = { ...newState.npcs[npcIndex], stats: newStats };
                }
            }
            return newState;
        });
        addNarrativeEvent(`Tác giả đã xóa trạng thái '${statName}' khỏi ${ownerType === 'player' ? 'người chơi' : `NPC ${statDetailData?.ownerName}`}.`);
        setIsStatDetailModalOpen(false);
    };

    const handleEquipItem = (itemToEquip: Equipment) => {
        setGameState(prev => {
            if (!prev) return null;

            const currentEquippedItem = prev.equipment[itemToEquip.slot];
            const newInventoryItems = prev.inventory.items.filter(i => i.id !== itemToEquip.id);
            
            if (currentEquippedItem) {
                newInventoryItems.push(currentEquippedItem);
            }

            const newEquipment = { ...prev.equipment, [itemToEquip.slot]: itemToEquip };

            return { 
                ...prev, 
                inventory: { ...prev.inventory, items: newInventoryItems },
                equipment: newEquipment 
            };
        });
        addNarrativeEvent(`Người chơi đã trang bị ${itemToEquip.name}.`);
    };

    const handleUnequipItem = (slot: EquipmentSlot) => {
        if (!gameState) return;
        const itemToUnequip = gameState.equipment[slot];
        if (!itemToUnequip) return;

        setGameState(prev => {
            if (!prev) return null;
            
            const itemToUnequip = prev.equipment[slot];
            if (!itemToUnequip) return prev;

            const newInventoryItems = [...prev.inventory.items, itemToUnequip];
            const newEquipment = { ...prev.equipment, [slot]: null };

            return {
                ...prev,
                inventory: { ...prev.inventory, items: newInventoryItems },
                equipment: newEquipment,
            };
        });
        addNarrativeEvent(`Người chơi đã tháo trang bị ${itemToUnequip.name}.`);
    };

    const handleOptimizeGame = async () => {
        if (!gameState) {
            alert("Không có dữ liệu game để tối ưu hóa.");
            return;
        }
        setIsSubmitting(true);
        await executeEntityAction('PLAYER_AND_ALL_NPCS', 'SANITIZE', { REGULAR: true, KNOWLEDGE: true });
        setIsSubmitting(false);
    };
    
    const endCombat = (result: 'win' | 'loss' | 'flee', turns: number, finalCombatants: any[]) => {
        if (!gameState) return;
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
        return <div className="flex items-center justify-center h-full bg-black text-white text-2xl animate-pulse">Đang sáng tạo thế giới...</div>;
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-3xl neumorphic-convex border border-red-500/50 rounded-2xl p-6 sm:p-8 flex flex-col">
                    <h2 className="text-2xl sm:text-3xl font-bold text-red-300 mb-4 text-center">Đã xảy ra lỗi nghiêm trọng</h2>
                    <pre className="bg-black/50 p-4 rounded-md text-red-200 whitespace-pre-wrap w-full max-h-[40vh] sm:max-h-[50vh] overflow-y-auto custom-scrollbar">{error}</pre>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <Button onClick={onBackToMenu} variant="secondary">Quay lại Menu</Button>
                        <Button onClick={handleOptimizeGame} variant="primary" disabled={isSubmitting || isLoading}>
                            {isSubmitting || isLoading ? 'Đang tối ưu hóa...' : 'Tối ưu hóa & Thử lại'}
                        </Button>
                    </div>
                </div>
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
                `}</style>
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
                <header className="flex-shrink-0 bg-[var(--bg-panel)] p-2 flex items-center border-b border-white/10 z-20">
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
                         <button onClick={() => setIsCodexOpen(true)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở Bách Khoa">
                            <BookIcon className="h-6 w-6"/>
                        </button>
                        <button onClick={() => setIsAutomationPanelOpen(true)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở Vận Mệnh & Thiên Cơ">
                            <TriggerIcon className="h-6 w-6"/>
                        </button>
                        <button onClick={() => handleToggleSection(setIsCharacterSectionOpen, characterSectionRef)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở bảng nhân vật">
                            <UserIcon className="h-6 w-6"/>
                        </button>
                         <button onClick={() => handleToggleSection(setIsInventorySectionOpen, inventorySectionRef)} className="p-2 text-neutral-300 hover:bg-white/10 rounded-full transition-colors" aria-label="Mở túi đồ">
                            <PackageIcon className="h-6 w-6"/>
                        </button>
                    </div>
                </header>
                
                <main ref={mainContentRef} className="flex-grow flex flex-col p-4 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full">
                       <StoryLog turn={currentTurnForView} />
                       {currentPage === totalPages && !isLoading && (
                            <div className="mt-6 animate-fade-in-fast" style={{animationDelay: '500ms'}}>
                               <FeedbackButtons onFeedback={(type) => console.log('Feedback:', type)} />
                               <div className="mt-4 space-y-4">
                                    <div ref={characterSectionRef} className="neumorphic-concave rounded-xl overflow-hidden transition-all duration-300">
                                        <button onClick={() => setIsCharacterSectionOpen(!isCharacterSectionOpen)} className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <UserIcon className="h-6 w-6 text-neutral-300"/>
                                                <h3 className="font-bold text-lg text-neutral-100">Bảng Nhân Vật</h3>
                                            </div>
                                            <ChevronIcon isExpanded={isCharacterSectionOpen} className="h-8 w-8 text-neutral-500" />
                                        </button>
                                        {isCharacterSectionOpen && <div className="p-4 sm:p-6 border-t border-[var(--shadow-color-1)] bg-[var(--bg-main)] animate-fade-in-fast"><CharacterSheet gameState={gameState} onStatClick={handleStatClick}/></div>}
                                    </div>
                                     <div ref={inventorySectionRef} className="neumorphic-concave rounded-xl overflow-hidden transition-all duration-300">
                                        <button onClick={() => setIsInventorySectionOpen(!isInventorySectionOpen)} className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <PackageIcon className="h-6 w-6 text-neutral-300"/>
                                                <h3 className="font-bold text-lg text-neutral-100">Túi Đồ & Trang Bị</h3>
                                            </div>
                                            <ChevronIcon isExpanded={isInventorySectionOpen} className="h-8 w-8 text-neutral-500" />
                                        </button>
                                        {isInventorySectionOpen && <div className="p-4 sm:p-6 border-t border-[var(--shadow-color-1)] bg-[var(--bg-main)] animate-fade-in-fast">
                                            <EquipmentAndInventoryPanel 
                                                gameState={gameState} 
                                                onEquip={handleEquipItem}
                                                onUnequip={handleUnequipItem}
                                                onShowAchievement={(item) => { setAchievementData(item); setIsAchievementModalOpen(true); }}
                                                setGameState={setGameState} 
                                                addNarrativeEvent={addNarrativeEvent}
                                            />
                                        </div>}
                                    </div>
                               </div>
                            </div>
                       )}
                    </div>
                </main>

                <footer className="flex-shrink-0 p-4 bg-[var(--bg-panel)] z-10 border-t border-white/10">
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

            <div className="fixed top-24 right-4 z-50 space-y-2">
                {notifications.map(n => (
                    <NotificationToast 
                        key={n.id}
                        message={n.message}
                        onDismiss={() => dismissNotification(n.id)}
                    />
                ))}
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
            
            <StatDetailModal
                isOpen={isStatDetailModalOpen}
                onClose={() => setIsStatDetailModalOpen(false)}
                stat={statDetailData?.stat || null}
                ownerName={statDetailData?.ownerName || ''}
                onSave={handleSaveStat}
                onDelete={handleDeleteStat}
                ownerType={statDetailData?.ownerType}
                ownerId={statDetailData?.ownerId}
            />
            
            <StatCreationModal 
                isOpen={isCreateStatModalOpen}
                onClose={() => setIsCreateStatModalOpen(false)}
                onSubmit={() => {}} // Placeholder
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
                onStatClick={handleStatClick}
            />

            <TriggerPanel 
                isOpen={isAutomationPanelOpen}
                onClose={() => setIsAutomationPanelOpen(false)}
                gameState={gameState}
                onUpdateTriggers={(newTriggers) => setGameState(prev => prev ? ({...prev, triggers: newTriggers}) : null)}
                onUpdateScenarios={(newScenarios) => setGameState(prev => prev ? ({ ...prev, customScenarios: newScenarios }) : null)}
            />
        </>
    );
};

export default GameScreen;
