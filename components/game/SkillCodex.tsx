import React, { useState } from 'react';
import { Skill, Ability, ViewMode } from '../../types';
import Button from '../ui/Button';

interface SkillCodexProps {
    skills: Skill[];
    onUseSkill: (skill: Skill, abilityName: string) => void;
    onRequestDelete: (skill: Skill) => void;
    onRequestEdit: (skillName: string, ability: Ability) => void;
    onOpenPowerCreationModal: () => void;
    viewMode: ViewMode;
}

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const SkillEntry: React.FC<{ skill: Skill; onUseSkill: (abilityName: string) => void; onRequestDelete: () => void; onRequestEdit: (ability: Ability) => void; }> = ({ skill, onUseSkill, onRequestDelete, onRequestEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-black/20 rounded-lg border border-neutral-700/50 overflow-hidden">
            <div
                className="w-full flex justify-between items-center p-3 text-left hover:bg-white/10 transition-colors duration-200"
            >
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex-grow flex items-center gap-2 text-left min-w-0">
                    <span className="font-bold text-lg text-white truncate">{skill.name}</span>
                </button>
                 <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                     <button onClick={onRequestDelete} className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" aria-label={`Xóa bộ kỹ năng ${skill.name}`}>
                        <TrashIcon />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                 </div>
            </div>
            {isExpanded && (
                <div className="px-3 pb-3 border-t border-neutral-700 animate-fade-in-fast">
                    <p className="text-sm text-neutral-400 italic my-2">{skill.description}</p>
                    <div className="space-y-3">
                    {skill.abilities.map(ability => (
                        <div key={ability.name} className="p-3 bg-black/20 rounded-md border border-transparent hover:border-neutral-600/50 transition-colors group">
                             <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-base text-neutral-200">{ability.name}</h4>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => onRequestEdit(ability)} className="p-1 rounded-full text-cyan-400 hover:bg-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Chỉnh sửa chiêu thức ${ability.name}`}>
                                        <PencilIcon />
                                    </button>
                                    <Button 
                                        onClick={() => onUseSkill(ability.name)}
                                        className="!w-auto !py-1 !px-3 !text-xs"
                                    >
                                        Sử dụng
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{ability.description}</p>
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const SkillCodex: React.FC<SkillCodexProps> = ({ skills, onUseSkill, onRequestDelete, onRequestEdit, onOpenPowerCreationModal, viewMode }) => {
    return (
        <div className="h-full flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
                 <div className="flex-1"></div> {/* Spacer */}
                <h2 className="text-xl font-bold text-center text-white" style={{ textShadow: '0 0 5px rgba(255,255,255,0.4)' }}>
                    Sổ Tay Kỹ Năng
                </h2>
                <div className="flex-1 text-right">
                    {viewMode === 'desktop' && (
                        <button
                            onClick={onOpenPowerCreationModal}
                            className="arcane-creator-btn"
                            title="Tạo bộ kỹ năng mới"
                        >
                            [+ Tạo Mới]
                        </button>
                    )}
                </div>
            </header>
            <div className="p-2 flex-grow min-h-0 overflow-y-auto custom-scrollbar">
                 {(!skills || skills.length === 0) ? (
                    <p className="text-center text-sm text-neutral-400 p-4">Nhân vật không có kỹ năng đặc biệt nào.</p>
                ) : (
                    <div className="space-y-2">
                        {skills.map((skill) => (
                            <SkillEntry 
                                key={skill.name} 
                                skill={skill} 
                                onUseSkill={(abilityName) => onUseSkill(skill, abilityName)}
                                onRequestDelete={() => onRequestDelete(skill)}
                                onRequestEdit={(ability) => onRequestEdit(skill.name, ability)}
                            />
                        ))}
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
                 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #444; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #666; }

                .arcane-creator-btn {
                    font-family: 'Rajdhani', sans-serif;
                    color: #d8b4fe;
                    background-color: transparent;
                    border: 1px solid transparent;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-shadow: 0 0 5px rgba(216, 180, 254, 0.5);
                }
                .arcane-creator-btn:hover {
                    color: #e9d5ff;
                    border-color: #c084fc;
                    text-shadow: 0 0 8px rgba(192, 132, 252, 0.7);
                }
             `}</style>
        </div>
    );
};

export default SkillCodex;