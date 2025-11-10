import React, { useState } from 'react';
import { GameState, Trigger, CustomScenario } from '../../../types';
import Button from '../../ui/Button';
import ToggleSwitch from '../../ui/ToggleSwitch';
import { PlusIcon } from '../../icons/PlusIcon';
import { EditIcon } from '../../icons/EditIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import TriggerEditorModal from './TriggerEditorModal';
import ScenarioEditorModal from '../scenarios/ScenarioEditorModal';
import { ArrowLeftIcon } from '../../icons/ArrowLeftIcon';

interface AutomationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onUpdateTriggers: (triggers: Trigger[]) => void;
  onUpdateScenarios: (scenarios: CustomScenario[]) => void;
}

type AutomationTab = 'triggers' | 'scenarios';

const AutomationPanel: React.FC<AutomationPanelProps> = ({ isOpen, onClose, gameState, onUpdateTriggers, onUpdateScenarios }) => {
    const [activeTab, setActiveTab] = useState<AutomationTab>('triggers');
    
    // State for Triggers
    const [isTriggerEditorOpen, setIsTriggerEditorOpen] = useState(false);
    const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);

    // State for Scenarios
    const [isScenarioEditorOpen, setIsScenarioEditorOpen] = useState(false);
    const [editingScenario, setEditingScenario] = useState<CustomScenario | null>(null);

    // --- Trigger Handlers ---
    const handleAddTrigger = () => { setEditingTrigger(null); setIsTriggerEditorOpen(true); };
    const handleEditTrigger = (trigger: Trigger) => { setEditingTrigger(trigger); setIsTriggerEditorOpen(true); };
    const handleSaveTrigger = (triggerToSave: Trigger) => {
        const newTriggers = editingTrigger ? gameState.triggers.map(t => t.id === editingTrigger.id ? triggerToSave : t) : [...gameState.triggers, triggerToSave];
        onUpdateTriggers(newTriggers);
        setIsTriggerEditorOpen(false);
    };
    const handleToggleEnable = (id: string, isEnabled: boolean) => {
        onUpdateTriggers(gameState.triggers.map(t => t.id === id ? { ...t, isEnabled } : t));
    };
    const handleDeleteTrigger = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Thiên Cơ Lệnh này không?")) {
            onUpdateTriggers(gameState.triggers.filter(t => t.id !== id));
        }
    };

    // --- Scenario Handlers ---
    const handleAddScenario = () => { setEditingScenario(null); setIsScenarioEditorOpen(true); };
    const handleEditScenario = (scenario: CustomScenario) => { setEditingScenario(scenario); setIsScenarioEditorOpen(true); };
    const handleSaveScenario = (scenarioToSave: CustomScenario) => {
        const newScenarios = editingScenario ? gameState.customScenarios.map(s => s.id === editingScenario.id ? scenarioToSave : s) : [...gameState.customScenarios, scenarioToSave];
        onUpdateScenarios(newScenarios);
        setIsScenarioEditorOpen(false);
    };
    const handleDeleteScenario = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Kịch Bản này không?")) {
            onUpdateScenarios(gameState.customScenarios.filter(s => s.id !== id));
        }
    };

    if (!isOpen) return null;

    const TabButton: React.FC<{ tabId: AutomationTab, children: React.ReactNode }> = ({ tabId, children }) => (
        <button onClick={() => setActiveTab(tabId)} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tabId ? 'neumorphic-convex text-white' : 'hover:bg-white/5 text-neutral-400'}`}>
            {children}
        </button>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-80 z-40 flex justify-center items-center p-4 sm:p-6 md:p-8 animate-fade-in-fast" onClick={onClose}>
                <div className="neumorphic-convex w-full max-w-4xl max-h-[90vh] my-auto flex flex-col rounded-2xl" onClick={(e) => e.stopPropagation()}>
                    <header className="relative flex-shrink-0 p-6 text-center border-b-2 border-white/10">
                         <button onClick={onClose} className="absolute left-4 sm:left-6 p-2 rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Quay lại">
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-3xl font-bold text-white font-rajdhani tracking-wider" style={{textShadow: '0 0 12px rgba(255,255,255,0.5)'}}>
                           Vận Mệnh & Thiên Cơ
                        </h2>
                    </header>
                    <div className="flex-shrink-0 flex gap-2 p-2 bg-black/20">
                        <TabButton tabId="triggers">Thiên Cơ Lệnh</TabButton>
                        <TabButton tabId="scenarios">Khung Cửi Vận Mệnh</TabButton>
                    </div>

                    <main className="flex-grow min-h-0 p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
                        {activeTab === 'triggers' && (
                            <>
                                <p className="text-sm text-neutral-400">Tạo các mệnh lệnh tự động kích hoạt dựa trên nội dung câu chuyện. Bạn có thể dùng Regex cho các điều kiện phức tạp.</p>
                                <div className="space-y-3">
                                    {gameState.triggers.map(trigger => (
                                        <div key={trigger.id} className="p-3 bg-black/20 rounded-lg border border-neutral-700 flex items-center gap-4">
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-white truncate">{trigger.name}</p>
                                                <p className="text-xs text-neutral-400 truncate mt-1">
                                                    <span className="font-mono bg-neutral-700/50 px-1 py-0.5 rounded">{trigger.condition}</span>
                                                    <span className="mx-1 text-pink-400 font-bold">&rarr;</span>
                                                    <span>{trigger.action.type}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <ToggleSwitch id={`ts-${trigger.id}`} label="" description="" enabled={trigger.isEnabled} setEnabled={(val) => handleToggleEnable(trigger.id, val)} />
                                                <button onClick={() => handleEditTrigger(trigger)} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"><EditIcon /></button>
                                                <button onClick={() => handleDeleteTrigger(trigger.id)} className="p-2 text-neutral-400 hover:text-red-500 rounded-full hover:bg-red-500/10"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {gameState.triggers.length === 0 && <p className="text-center text-neutral-500 py-8">Chưa có Thiên Cơ Lệnh nào.</p>}
                                <Button onClick={handleAddTrigger} className="w-full mt-4 flex items-center justify-center gap-2"><PlusIcon /> Tạo Lệnh Mới</Button>
                            </>
                        )}
                        {activeTab === 'scenarios' && (
                             <>
                                <p className="text-sm text-neutral-400">Tạo các kịch bản phức tạp với chuỗi điều kiện và hành động. Ra lệnh cho AI kích hoạt chúng bằng "Thiên Mệnh Tác Giả" thông qua hàm `triggerCustomScenario`.</p>
                                <div className="space-y-3">
                                    {gameState.customScenarios.map(scenario => (
                                        <div key={scenario.id} className="p-3 bg-black/20 rounded-lg border border-neutral-700 flex items-center gap-4">
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-white truncate">{scenario.name}</p>
                                                <p className="text-xs text-neutral-400 truncate mt-1">ID: <span className="font-mono bg-neutral-700/50 px-1 py-0.5 rounded">{scenario.id}</span></p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={() => handleEditScenario(scenario)} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"><EditIcon /></button>
                                                <button onClick={() => handleDeleteScenario(scenario.id)} className="p-2 text-neutral-400 hover:text-red-500 rounded-full hover:bg-red-500/10"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {gameState.customScenarios.length === 0 && <p className="text-center text-neutral-500 py-8">Chưa có kịch bản nào.</p>}
                                <Button onClick={handleAddScenario} className="w-full mt-4 flex items-center justify-center gap-2"><PlusIcon /> Tạo Kịch Bản</Button>
                             </>
                        )}
                    </main>
                </div>
            </div>
            <TriggerEditorModal isOpen={isTriggerEditorOpen} onClose={() => setIsTriggerEditorOpen(false)} onSave={handleSaveTrigger} trigger={editingTrigger} existingIds={gameState.triggers.map(t => t.id)} />
            <ScenarioEditorModal isOpen={isScenarioEditorOpen} onClose={() => setIsScenarioEditorOpen(false)} onSave={handleSaveScenario} scenario={editingScenario} existingIds={gameState.customScenarios.map(t => t.id)} gameState={gameState} />
            <style>{`
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #555 #171717; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
                .animate-fade-in-fast { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </>
    );
};

export default AutomationPanel;
