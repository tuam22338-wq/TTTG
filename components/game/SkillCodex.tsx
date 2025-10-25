import React, { useState, useMemo } from 'react';
import { Skill, Ability, ViewMode } from '../../types';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';

interface SkillCodexProps {
    skills: Skill[];
    onUseSkill: (skill: Skill, abilityName: string) => void;
    onRequestDelete: (skill: Skill) => void;
    onRequestEdit: (skillName: string, ability: Ability) => void;
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
        <div className="bg-black/20 rounded-xl border border-neutral-700/50 overflow-hidden">
            <div
                className="w-full flex justify-between items-center p-3 text-left hover:bg-white/10 transition-colors duration-200"
            >
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex-grow flex items-center gap-4 text-left min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black/40 rounded-lg border border-white/10 text-xl font-bold text-pink-300">
                        {skill.name.charAt(0)}
                    </div>
                    <div>
                        <span className="font-bold text-lg text-white truncate">{skill.name}</span>
                        <p className="text-xs text-neutral-400">{`Năng lượng: ${skill.cost} | Hồi chiêu: ${skill.cooldown} lượt`}</p>
                    </div>
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
                <div className="px-4 pb-4 border-t border-neutral-700 animate-fade-in-fast">
                    <p className="text-sm text-neutral-300 italic my-3">{skill.description}</p>
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


const SkillCodex: React.FC<SkillCodexProps> = ({ skills, onUseSkill, onRequestDelete, onRequestEdit, viewMode }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSkills = useMemo(() => {
        if (!searchTerm.trim()) {
            return skills;
        }
        return skills.filter(skill => 
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [skills, searchTerm]);

    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex-shrink-0 mb-4">
                <div className="relative">
                    <InputField
                        id="skill-search"
                        placeholder="Tìm kiếm kỹ năng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="!py-2 !pl-10"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                        <SearchIcon />
                    </div>
                </div>
            </div>

            <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                 {(!filteredSkills || filteredSkills.length === 0) ? (
                    <p className="text-center text-sm text-neutral-500 p-4 pt-16">{skills.length === 0 ? "Nhân vật không có kỹ năng đặc biệt nào." : "Không tìm thấy kỹ năng phù hợp."}</p>
                ) : (
                    <div className="space-y-3">
                        {filteredSkills.map((skill) => (
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
             `}</style>
        </div>
    );
};

export default SkillCodex;
