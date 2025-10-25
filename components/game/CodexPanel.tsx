import React, { useState, useMemo, useEffect } from 'react';
import { GameState, NPC, WorldRule } from '../../types';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import ToggleSwitch from '../ui/ToggleSwitch';
import Button from '../ui/Button';
import { BookIcon } from '../icons/BookIcon';
import { LawIcon } from '../icons/LawIcon';
import { PlusIcon } from '../icons/PlusIcon';


interface CodexPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onUpdateRule: (ruleId: string, updatedRule: Partial<WorldRule>) => void;
  onAddRule: (newRule: Omit<WorldRule, 'id'>) => void;
  onDeleteRule: (ruleId: string) => void;
}

type CodexTab = 'lore' | 'rules';
type SelectedEntry = { type: 'lore' | 'rule', id: string };

const CodexPanel: React.FC<CodexPanelProps> = ({ isOpen, onClose, gameState, onUpdateRule, onAddRule, onDeleteRule }) => {
  const [activeTab, setActiveTab] = useState<CodexTab>('lore');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SelectedEntry | null>(null);

  useEffect(() => {
      if(isOpen) {
          setSearchTerm('');
          setSelectedEntry(null);
          setActiveTab('lore');
      }
  }, [isOpen]);

  const allLore = useMemo(() => [
    ...gameState.worldContext.initialLore,
    ...gameState.codex,
  ], [gameState.worldContext.initialLore, gameState.codex]);

  const filteredLore = useMemo(() => 
    allLore.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allLore, searchTerm]
  );

  const filteredRules = useMemo(() => 
    gameState.worldContext.specialRules.filter(rule => 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.content.toLowerCase().includes(searchTerm.toLowerCase())
    ), [gameState.worldContext.specialRules, searchTerm]
  );
  
  const currentEntryData = useMemo(() => {
      if (!selectedEntry) return null;
      const source = selectedEntry.type === 'lore' ? allLore : gameState.worldContext.specialRules;
      return source.find(item => item.id === selectedEntry.id) || null;
  }, [selectedEntry, allLore, gameState.worldContext.specialRules]);

  const handleSelectEntry = (type: 'lore' | 'rule', id: string) => {
      setSelectedEntry({ type, id });
  };
  
  const NavButton: React.FC<{ tabId: CodexTab, icon: React.ReactNode, label: string }> = ({ tabId, icon, label }) => {
    const isActive = activeTab === tabId;
    return (
      <button
        onClick={() => {
            setActiveTab(tabId);
            setSelectedEntry(null);
        }}
        className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 aspect-square ${
          isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'
        }`}
        title={label}
      >
        <div className="h-7 w-7">{icon}</div>
        <span className="text-xs mt-1 font-semibold">{label}</span>
      </button>
    );
  };
  
  const EntryListItem: React.FC<{ entry: WorldRule, type: 'lore' | 'rule' }> = ({ entry, type }) => {
    const isSelected = selectedEntry?.id === entry.id;
    return (
         <button 
            onClick={() => handleSelectEntry(type, entry.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 relative overflow-hidden ${isSelected ? 'bg-pink-900/40' : 'hover:bg-neutral-800/60'}`}
        >
            {isSelected && <div className="absolute left-0 top-0 h-full w-1 bg-pink-400 animate-fade-in-fast"></div>}
            <p className={`font-bold truncate pl-2 ${isSelected ? 'text-pink-300' : 'text-neutral-200'}`}>{entry.name || '(Chưa có tên)'}</p>
            <p className="text-xs text-neutral-400 truncate mt-1 pl-2">{entry.content}</p>
        </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 p-4 animate-fade-in-fast" onClick={onClose}>
      <div
        className="relative w-full h-full bg-gradient-to-br from-[#110d18] to-[#0e0c14] rounded-2xl border border-neutral-700 shadow-2xl flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nav Column */}
        <nav className="w-24 flex-shrink-0 bg-black/20 border-r border-neutral-700/50 p-3 flex flex-col items-center gap-3">
            <NavButton tabId="lore" label="Bách Khoa" icon={<BookIcon className="h-full w-full"/>} />
            <NavButton tabId="rules" label="Quy Luật" icon={<LawIcon className="h-full w-full"/>} />
        </nav>

        {/* List Column */}
        <aside className="w-80 flex-shrink-0 border-r border-neutral-700/50 flex flex-col bg-black/10">
             <div className="p-3 border-b border-neutral-700/50">
                 <div className="relative">
                    <InputField id="codex-search" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="!pl-9 !py-2 !rounded-md"/>
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500">
                        <SearchIcon />
                    </div>
                </div>
             </div>
             <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
                 {activeTab === 'lore' && (
                    <div className="space-y-1">
                        {filteredLore.map(entry => <EntryListItem key={entry.id} entry={entry} type="lore" />)}
                        {filteredLore.length === 0 && <p className="text-center text-sm text-neutral-500 p-4">Không có mục nào.</p>}
                    </div>
                )}
                {activeTab === 'rules' && (
                     <div className="space-y-1">
                        {filteredRules.map(entry => <EntryListItem key={entry.id} entry={entry} type="rule" />)}
                         {filteredRules.length === 0 && <p className="text-center text-sm text-neutral-500 p-4">Không có quy luật nào.</p>}
                    </div>
                )}
             </div>
             {activeTab === 'rules' && (
                <div className="flex-shrink-0 p-2 border-t border-neutral-700/50">
                     <Button onClick={() => onAddRule({name: 'Quy luật mới', content: '', isEnabled: true})} variant="secondary" className="w-full !text-sm !py-2 flex items-center justify-center gap-2">
                         <PlusIcon /> Thêm Quy Luật
                     </Button>
                </div>
            )}
        </aside>

        {/* Detail Column */}
        <main className="flex-grow p-8 overflow-y-auto custom-scrollbar">
             {currentEntryData ? (
                <div className="space-y-6 animate-fade-in-fast">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-4xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            {currentEntryData.name}
                        </h3>
                        {selectedEntry?.type === 'rule' && (
                            <div className="flex items-center gap-3 flex-shrink-0 mt-2">
                                <span className="text-sm font-semibold text-neutral-400">{currentEntryData.isEnabled ? 'Đang Bật' : 'Đang Tắt'}</span>
                                <ToggleSwitch id={`rule-toggle-${currentEntryData.id}`} label="" description="" enabled={currentEntryData.isEnabled ?? true} setEnabled={val => onUpdateRule(currentEntryData.id, { isEnabled: val })} />
                                <button onClick={() => {}} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"><EditIcon /></button>
                                <button onClick={() => {onDeleteRule(currentEntryData.id); setSelectedEntry(null);}} className="p-2 text-neutral-400 hover:text-red-500 rounded-full hover:bg-red-500/10"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        )}
                    </div>
                    <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed text-lg" style={{whiteSpace: 'pre-wrap'}}>{currentEntryData.content}</div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                    <BookIcon className="h-24 w-24" />
                    <p className="mt-4 text-lg font-semibold">Chọn một mục để xem chi tiết</p>
                    <p className="text-sm">Khám phá tri thức và luật lệ của thế giới.</p>
                </div>
            )}
        </main>
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <style>{`
          .animate-fade-in-fast { animation: fadeIn 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CodexPanel;