import React, { useState } from 'react';
import { WorldCreationState, CultivationSystemSettings, CultivationMainTier, CultivationSubTier, CultivationStatBonus } from '../../types';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import StatBonusModal from './StatBonusModal';
import { STAT_BONUS_OPTIONS } from './StatBonusModal';
import ChevronIcon from '../icons/ChevronIcon';


interface CultivationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WorldCreationState;
  setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const CultivationEditorModal: React.FC<CultivationEditorModalProps> = ({ isOpen, onClose, state, setState }) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isStatBonusModalOpen, setIsStatBonusModalOpen] = useState(false);
    const [currentTargetTierId, setCurrentTargetTierId] = useState<string | null>(null);

    const handleSystemChange = (field: keyof CultivationSystemSettings, value: string) => {
        setState(s => ({
            ...s,
            cultivationSystem: { ...s.cultivationSystem, [field]: value }
        }));
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleAddMainTier = () => {
        const newTier: CultivationMainTier = {
            id: `main_${Date.now()}`,
            name: '',
            description: '',
            breakthroughRequirement: '',
            subTiers: [],
            statBonuses: [],
        };
        setState(s => ({
            ...s,
            cultivationSystem: { ...s.cultivationSystem, mainTiers: [...s.cultivationSystem.mainTiers, newTier] }
        }));
        toggleExpand(newTier.id);
    };

    const handleRemoveMainTier = (id: string) => {
        setState(s => ({
            ...s,
            cultivationSystem: { ...s.cultivationSystem, mainTiers: s.cultivationSystem.mainTiers.filter(t => t.id !== id) }
        }));
    };

    const handleMainTierChange = (id: string, field: keyof Omit<CultivationMainTier, 'id' | 'subTiers' | 'statBonuses'>, value: string) => {
        setState(s => ({
            ...s,
            cultivationSystem: {
                ...s.cultivationSystem,
                mainTiers: s.cultivationSystem.mainTiers.map(t => t.id === id ? { ...t, [field]: value } : t)
            }
        }));
    };

    const handleAddSubTier = (mainTierId: string) => {
        const newSubTier: CultivationSubTier = { id: `sub_${Date.now()}`, name: '' };
        setState(s => ({
            ...s,
            cultivationSystem: {
                ...s.cultivationSystem,
                mainTiers: s.cultivationSystem.mainTiers.map(t => 
                    t.id === mainTierId ? { ...t, subTiers: [...t.subTiers, newSubTier] } : t
                )
            }
        }));
    };
    
    const handleSubTierChange = (mainTierId: string, subTierId: string, value: string) => {
        setState(s => ({
            ...s,
            cultivationSystem: {
                ...s.cultivationSystem,
                mainTiers: s.cultivationSystem.mainTiers.map(t => 
                    t.id === mainTierId ? { ...t, subTiers: t.subTiers.map(st => st.id === subTierId ? { ...st, name: value } : st) } : t
                )
            }
        }));
    };

    const handleRemoveSubTier = (mainTierId: string, subTierId: string) => {
        setState(s => ({
            ...s,
            cultivationSystem: {
                ...s.cultivationSystem,
                mainTiers: s.cultivationSystem.mainTiers.map(t => 
                    t.id === mainTierId ? { ...t, subTiers: t.subTiers.filter(st => st.id !== subTierId) } : t
                )
            }
        }));
    };

    const handleOpenStatBonusModal = (mainTierId: string) => {
        setCurrentTargetTierId(mainTierId);
        setIsStatBonusModalOpen(true);
    };
    
    const handleAddStatBonus = (bonus: CultivationStatBonus) => {
        if (!currentTargetTierId) return;
        setState(s => ({
            ...s,
            cultivationSystem: {
                ...s.cultivationSystem,
                mainTiers: s.cultivationSystem.mainTiers.map(t => 
                    t.id === currentTargetTierId ? { ...t, statBonuses: [...t.statBonuses, bonus] } : t
                )
            }
        }));
    };

    const handleRemoveStatBonus = (mainTierId: string, bonusIndex: number) => {
         setState(s => ({
            ...s,
            cultivationSystem: {
                ...s.cultivationSystem,
                mainTiers: s.cultivationSystem.mainTiers.map(t => 
                    t.id === mainTierId ? { ...t, statBonuses: t.statBonuses.filter((_, i) => i !== bonusIndex) } : t
                )
            }
        }));
    };


    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start p-4 sm:p-6 md:p-8 animate-fade-in-fast overflow-y-auto">
                <div 
                    className="bg-neutral-900 backdrop-blur-xl border-2 border-neutral-700 shadow-2xl rounded-2xl w-full max-w-4xl h-auto md:h-[90vh] my-auto flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex-shrink-0 p-6 text-center border-b-2 border-neutral-800">
                        <h2 className="text-3xl font-bold text-white font-rajdhani tracking-wider" style={{textShadow: '0 0 12px rgba(255,255,255,0.5)'}}>
                            Chỉnh Sửa Hệ Thống Cảnh Giới
                        </h2>
                    </header>
                    
                    <main className="flex-grow min-h-0 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        <section className="bg-neutral-800/50 p-4 rounded-lg">
                             <h3 className="text-xl font-bold text-neutral-100 mb-3">Thông Tin Hệ Thống</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField id="sys-name" label="Tên Hệ Thống" placeholder="VD: Hệ Thống Hồn Sư" value={state.cultivationSystem.systemName} onChange={e => handleSystemChange('systemName', e.target.value)} />
                                <InputField id="sys-resource" label="Tên Tài Nguyên" placeholder="VD: Hồn Lực" value={state.cultivationSystem.resourceName} onChange={e => handleSystemChange('resourceName', e.target.value)} />
                                <InputField id="sys-unit" label="Đơn Vị" placeholder="VD: năm, cấp" value={state.cultivationSystem.unitName} onChange={e => handleSystemChange('unitName', e.target.value)} />
                                <div className="sm:col-span-2">
                                     <TextareaField id="sys-desc" label="Mô tả hệ thống" rows={2} placeholder="Giải thích về nguồn gốc và cách hoạt động của hệ thống tu luyện này..." value={state.cultivationSystem.description} onChange={e => handleSystemChange('description', e.target.value)} />
                                </div>
                             </div>
                        </section>

                        <section className="bg-neutral-800/50 p-4 rounded-lg">
                            <h3 className="text-xl font-bold text-neutral-100 mb-3">Các Cấp Bậc</h3>
                             <div className="space-y-3">
                                {state.cultivationSystem.mainTiers.map(tier => (
                                    <div key={tier.id} className="bg-neutral-900/50 rounded-lg border border-neutral-700/50 overflow-hidden">
                                        <div className="flex items-center p-3">
                                            <div className="flex-grow min-w-0">
                                                <InputField value={tier.name} onChange={e => handleMainTierChange(tier.id, 'name', e.target.value)} id={`tier-name-${tier.id}`} placeholder="Tên Cấp Bậc Chính" className="!py-1 !px-2 text-base font-semibold" />
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                                <button onClick={() => handleRemoveMainTier(tier.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full"><TrashIcon /></button>
                                                <button onClick={() => toggleExpand(tier.id)} className="p-1.5 text-gray-400 hover:text-white rounded-full"><ChevronIcon isExpanded={expandedIds.has(tier.id)} /></button>
                                            </div>
                                        </div>
                                        {expandedIds.has(tier.id) && (
                                            <div className="p-3 border-t border-neutral-700 space-y-4 animate-fade-in-fast">
                                                <TextareaField label="Mô tả Cấp Bậc" id={`tier-desc-${tier.id}`} rows={2} value={tier.description} onChange={e => handleMainTierChange(tier.id, 'description', e.target.value)} />
                                                <TextareaField label="Yêu cầu / Phương thức Đột phá" id={`tier-break-${tier.id}`} rows={2} value={tier.breakthroughRequirement} onChange={e => handleMainTierChange(tier.id, 'breakthroughRequirement', e.target.value)} />
                                                
                                                <div>
                                                    <h4 className="text-sm font-semibold text-neutral-400 mb-2">Cấp Bậc Nhỏ</h4>
                                                    <div className="space-y-2">
                                                        {tier.subTiers.map(sub => (
                                                            <div key={sub.id} className="flex items-center gap-2">
                                                                <InputField value={sub.name} onChange={e => handleSubTierChange(tier.id, sub.id, e.target.value)} id={`sub-name-${sub.id}`} placeholder="VD: Sơ kỳ, Trung kỳ..." className="!py-1.5 flex-grow"/>
                                                                <button onClick={() => handleRemoveSubTier(tier.id, sub.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full"><TrashIcon /></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => handleAddSubTier(tier.id)} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-1 text-xs border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-neutral-700/50 hover:text-white hover:border-neutral-500 hover:border-solid font-semibold">+ Thêm Cấp Bậc Nhỏ</button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-semibold text-neutral-400 mb-2">Thuộc Tính Cộng Thêm (Khi đạt cấp này)</h4>
                                                    <div className="space-y-1">
                                                        {tier.statBonuses.length === 0 && <p className="text-xs text-gray-500 italic">Không có.</p>}
                                                        {tier.statBonuses.map((bonus, index) => (
                                                            <div key={index} className="flex justify-between items-center bg-black/20 px-2 py-1 rounded">
                                                                <span className="text-sm text-green-300">{STAT_BONUS_OPTIONS.find(o => o.value === bonus.stat)?.label || bonus.stat}: +{bonus.value}</span>
                                                                <button onClick={() => handleRemoveStatBonus(tier.id, index)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => handleOpenStatBonusModal(tier.id)} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-1 text-xs border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-neutral-700/50 hover:text-white hover:border-neutral-500 hover:border-solid font-semibold mt-2">+ Cộng Thuộc Tính</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button onClick={handleAddMainTier} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-2 text-sm border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-neutral-700/50 hover:text-white hover:border-neutral-500 hover:border-solid font-semibold">+ Thêm Cấp Bậc Chính</button>
                             </div>
                        </section>
                    </main>

                    <footer className="p-6 border-t-2 border-neutral-800 flex-shrink-0 bg-black/20">
                    <Button onClick={onClose} variant="secondary" className="w-full max-w-sm mx-auto flex justify-center">
                        Lưu và Đóng
                    </Button>
                    </footer>
                </div>
            </div>
             <style>{`
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #555 #171717; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
            `}</style>
             <StatBonusModal
                isOpen={isStatBonusModalOpen}
                onClose={() => setIsStatBonusModalOpen(false)}
                onAddBonus={handleAddStatBonus}
            />
        </>
    );
};

export default CultivationEditorModal;