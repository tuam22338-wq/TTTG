
import React, { useState } from 'react';
import { WorldCreationState, InitialFaction, InitialNpc } from '../../types';
import FormSection from './FormSection';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import Button from '../ui/Button';
import ChevronIcon from '../icons/ChevronIcon';

interface InitialEntitiesFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const InitialEntitiesForm: React.FC<InitialEntitiesFormProps> = ({ state, setState }) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    // --- Faction Handlers ---
    const handleAddFaction = () => {
        const newFaction: InitialFaction = {
            id: `faction_${Date.now()}`,
            name: '', type: '', style: '', territory: '',
            reputation: 'Trung lập', powerLevel: 'Trung bình',
            resources: '', playerRelation: '', description: ''
        };
        setState(s => ({ ...s, initialFactions: [...s.initialFactions, newFaction] }));
        toggleExpand(newFaction.id);
    };

    const handleRemoveFaction = (id: string) => {
        setState(s => ({ ...s, initialFactions: s.initialFactions.filter(f => f.id !== id) }));
    };

    const handleFactionChange = (id: string, field: keyof Omit<InitialFaction, 'id'>, value: any) => {
        setState(s => ({
            ...s,
            initialFactions: s.initialFactions.map(f => f.id === id ? { ...f, [field]: value } : f)
        }));
    };

    // --- NPC Handlers ---
    const handleAddNpc = () => {
        const newNpc: InitialNpc = {
            id: `npc_${Date.now()}`,
            name: '', gender: '', personality: '', initialRealm: '',
            appearance: '', backstory: '', factionId: 'independent',
            playerRelation: '', specialSetting: ''
        };
        setState(s => ({ ...s, initialNpcs: [...s.initialNpcs, newNpc] }));
        toggleExpand(newNpc.id);
    };

    const handleRemoveNpc = (id: string) => {
        setState(s => ({ ...s, initialNpcs: s.initialNpcs.filter(n => n.id !== id) }));
    };

    const handleNpcChange = (id: string, field: keyof Omit<InitialNpc, 'id'>, value: any) => {
        setState(s => ({
            ...s,
            initialNpcs: s.initialNpcs.map(n => n.id === id ? { ...n, [field]: value } : n)
        }));
    };

    const selectClass = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";

    return (
        <FormSection title="Tạo Thực Thể Ban Đầu" description="Xây dựng các thế lực và nhân vật quan trọng để làm thế giới thêm sống động.">
            {/* Factions Section */}
            <div>
                <h3 className="text-xl font-bold text-neutral-100 mb-3">Thế lực khởi đầu</h3>
                <div className="space-y-3">
                    {state.initialFactions.map(faction => {
                        const isExpanded = expandedIds.has(faction.id);
                        return (
                            <div key={faction.id} className="bg-black/20 rounded-lg border border-white/10 overflow-hidden transition-all">
                                <div className="flex items-center p-3">
                                    <div className="flex-grow min-w-0">
                                        <InputField value={faction.name} onChange={e => handleFactionChange(faction.id, 'name', e.target.value)} id={`faction-name-${faction.id}`} placeholder="Tên thế lực" className="!py-1 !px-2 text-base font-semibold" />
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <button onClick={() => handleRemoveFaction(faction.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon /></button>
                                        <button onClick={() => toggleExpand(faction.id)} className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"><ChevronIcon isExpanded={isExpanded} /></button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-3 border-t border-white/10 space-y-4 animate-fade-in-fast">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InputField label="Loại thế lực" id={`faction-type-${faction.id}`} value={faction.type} onChange={e => handleFactionChange(faction.id, 'type', e.target.value)} placeholder="Tông môn, Gia tộc..."/>
                                            <InputField label="Đặc trưng / Phong cách" id={`faction-style-${faction.id}`} value={faction.style} onChange={e => handleFactionChange(faction.id, 'style', e.target.value)} placeholder="Kiếm đạo, Luyện đan..."/>
                                            <InputField label="Địa bàn / Vùng ảnh hưởng" id={`faction-territory-${faction.id}`} value={faction.territory} onChange={e => handleFactionChange(faction.id, 'territory', e.target.value)} placeholder="Thanh Vân Sơn..."/>
                                            <InputField label="Tài nguyên & Ưu thế" id={`faction-resources-${faction.id}`} value={faction.resources} onChange={e => handleFactionChange(faction.id, 'resources', e.target.value)} placeholder="Nhiều đệ tử, giàu có..."/>
                                            <div>
                                                <label htmlFor={`faction-rep-${faction.id}`} className="block text-sm font-medium text-neutral-400 mb-2">Danh tiếng</label>
                                                <select id={`faction-rep-${faction.id}`} value={faction.reputation} onChange={e => handleFactionChange(faction.id, 'reputation', e.target.value)} className={selectClass}>
                                                    <option value="Chính phái">Chính phái</option>
                                                    <option value="Trung lập">Trung lập</option>
                                                    <option value="Tà phái">Tà phái</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor={`faction-power-${faction.id}`} className="block text-sm font-medium text-neutral-400 mb-2">Mức độ thế lực</label>
                                                <select id={`faction-power-${faction.id}`} value={faction.powerLevel} onChange={e => handleFactionChange(faction.id, 'powerLevel', e.target.value)} className={selectClass}>
                                                    <option value="Nhỏ">Nhỏ</option>
                                                    <option value="Trung bình">Trung bình</option>
                                                    <option value="Lớn">Lớn</option>
                                                    <option value="Bá chủ">Bá chủ</option>
                                                </select>
                                            </div>
                                        </div>
                                        <TextareaField 
                                            label="Mô Tả Thực Thể" 
                                            id={`faction-description-${faction.id}`} 
                                            value={faction.description} 
                                            onChange={e => handleFactionChange(faction.id, 'description', e.target.value)} 
                                            rows={3} 
                                            placeholder="Mô tả chi tiết về lịch sử, thành viên chủ chốt, mục tiêu, văn hóa... của thế lực này."
                                        />
                                         <TextareaField label="Quan hệ với người chơi" id={`faction-player-rel-${faction.id}`} value={faction.playerRelation} onChange={e => handleFactionChange(faction.id, 'playerRelation', e.target.value)} rows={2} placeholder="Thân thiện, huyết thù..."/>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <button onClick={handleAddFaction} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-2 text-sm border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-white/5 hover:text-white hover:border-white/10 hover:border-solid font-semibold">+ Thêm Thế lực</button>
                </div>
            </div>

            {/* NPCs Section */}
            <div className="pt-6 border-t border-white/10 mt-6">
                <h3 className="text-xl font-bold text-neutral-100 mb-3">NPC khởi đầu</h3>
                <div className="space-y-3">
                     {state.initialNpcs.map(npc => {
                        const isExpanded = expandedIds.has(npc.id);
                        return (
                            <div key={npc.id} className="bg-black/20 rounded-lg border border-white/10 overflow-hidden transition-all">
                                <div className="flex items-center p-3">
                                    <div className="flex-grow min-w-0">
                                        <InputField value={npc.name} onChange={e => handleNpcChange(npc.id, 'name', e.target.value)} id={`npc-name-${npc.id}`} placeholder="Tên NPC" className="!py-1 !px-2 text-base font-semibold" />
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <button onClick={() => handleRemoveNpc(npc.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon /></button>
                                        <button onClick={() => toggleExpand(npc.id)} className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"><ChevronIcon isExpanded={isExpanded} /></button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-3 border-t border-white/10 space-y-4 animate-fade-in-fast">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InputField label="Giới tính" id={`npc-gender-${npc.id}`} value={npc.gender} onChange={e => handleNpcChange(npc.id, 'gender', e.target.value)} placeholder="Nam, Nữ..."/>
                                            <InputField label="Tính cách" id={`npc-personality-${npc.id}`} value={npc.personality} onChange={e => handleNpcChange(npc.id, 'personality', e.target.value)} placeholder="Mưu mô, chính trực..."/>
                                            <InputField label="Cảnh giới ban đầu" id={`npc-realm-${npc.id}`} value={npc.initialRealm} onChange={e => handleNpcChange(npc.id, 'initialRealm', e.target.value)} placeholder="Luyện Khí sơ kỳ..."/>
                                            <div>
                                                <label htmlFor={`npc-faction-${npc.id}`} className="block text-sm font-medium text-neutral-400 mb-2">Thế lực hiện tại</label>
                                                <select id={`npc-faction-${npc.id}`} value={npc.factionId} onChange={e => handleNpcChange(npc.id, 'factionId', e.target.value)} className={selectClass}>
                                                    <option value="independent">Không thuộc thế lực nào</option>
                                                    {state.initialFactions.map(f => (
                                                        <option key={f.id} value={f.id}>{f.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <TextareaField label="Chi tiết ngoại hình" id={`npc-appearance-${npc.id}`} value={npc.appearance} onChange={e => handleNpcChange(npc.id, 'appearance', e.target.value)} rows={2} placeholder="Tóc trắng, mắt đỏ..."/>
                                        <TextareaField label="Tiểu sử" id={`npc-backstory-${npc.id}`} value={npc.backstory} onChange={e => handleNpcChange(npc.id, 'backstory', e.target.value)} rows={2} placeholder="Xuất thân từ gia tộc bị diệt môn..."/>
                                        <TextareaField label="Mối quan hệ với người chơi" id={`npc-player-rel-${npc.id}`} value={npc.playerRelation} onChange={e => handleNpcChange(npc.id, 'playerRelation', e.target.value)} rows={2} placeholder="Huynh đệ, kẻ thù..."/>
                                        <TextareaField label="Thiết lập đặc biệt" id={`npc-special-${npc.id}`} value={npc.specialSetting} onChange={e => handleNpcChange(npc.id, 'specialSetting', e.target.value)} rows={2} placeholder="Miễn tử, có bí mật lớn..."/>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <button onClick={handleAddNpc} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-2 text-sm border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-white/5 hover:text-white hover:border-white/10 hover:border-solid font-semibold">+ Thêm NPC</button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </FormSection>
    );
};

export default InitialEntitiesForm;
