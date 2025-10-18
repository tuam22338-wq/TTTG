import React, { useState, useMemo, useEffect } from 'react';
import { GameState, NPC, WorldRule } from '../../types';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import ToggleSwitch from '../ui/ToggleSwitch';
import Button from '../ui/Button';

// Re-using for a different purpose
import { BookIcon } from '../icons/BookIcon';


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
  
  const TabButton: React.FC<{ tabId: CodexTab; label: string }> = ({ tabId, label }) => {
    const isActive = activeTab === tabId;
    return (
      <button
        onClick={() => {
            setActiveTab(tabId);
            setSelectedEntry(null);
        }}
        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
          isActive 
            ? 'text-white bg-neutral-700/80 border-b-2 border-pink-500' 
            : 'text-neutral-400 bg-neutral-900/50 hover:bg-neutral-800'
        }`}
      >
        {label}
      </button>
    );
  };
  
  const EntryListItem: React.FC<{ entry: WorldRule, type: 'lore' | 'rule' }> = ({ entry, type }) => {
    const isSelected = selectedEntry?.id === entry.id;
    return (
         <button 
            onClick={() => handleSelectEntry(type, entry.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${isSelected ? 'bg-pink-500/20' : 'hover:bg-white/5'}`}
        >
            <p className={`font-bold truncate ${isSelected ? 'text-pink-300' : 'text-white'}`}>{entry.name || '(Chưa có tên)'}</p>
            <p className="text-xs text-neutral-400 truncate mt-1">{entry.content}</p>
        </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-6xl h-[90vh] bg-neutral-900/90 backdrop-blur-md flex flex-col rounded-2xl border border-neutral-700 shadow-2xl animate-fade-in-fast"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-neutral-700">
            <div className="flex items-center gap-3">
                <BookIcon className="h-7 w-7 text-pink-400" />
                <h2 className="text-2xl font-bold text-white font-rajdhani">Bách Khoa Toàn Thư</h2>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </header>

        {/* Search & Tabs */}
         <div className="flex-shrink-0 p-3 border-b border-neutral-700 space-y-3">
             <div className="relative">
                <InputField id="codex-search" placeholder="Tìm kiếm mục..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="!pl-10"/>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                    <SearchIcon />
                </div>
            </div>
         </div>
        <div className="flex-shrink-0 flex"><TabButton tabId="lore" label="Mục Bách Khoa" /><TabButton tabId="rules" label="Quy Luật Thế Giới" /></div>
        
        {/* Main Content */}
        <main className="flex-grow min-h-0 flex">
            {/* Left Panel: List */}
            <aside className="w-1/3 border-r border-neutral-700 flex flex-col">
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
                    <div className="flex-shrink-0 p-2 border-t border-neutral-700">
                         <Button onClick={() => onAddRule({name: 'Quy luật mới', content: '', isEnabled: true})} variant="secondary" className="w-full !text-sm !py-2">+ Thêm Quy Luật</Button>
                    </div>
                )}
            </aside>

            {/* Right Panel: Details */}
            <section className="w-2/3 overflow-y-auto p-6 custom-scrollbar">
                {currentEntryData ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                             <h3 className="text-2xl font-bold font-rajdhani text-pink-300">{currentEntryData.name}</h3>
                             {selectedEntry?.type === 'rule' && (
                                <div className="flex items-center gap-2">
                                    <ToggleSwitch id={`rule-toggle-${currentEntryData.id}`} label="" description="" enabled={currentEntryData.isEnabled ?? true} setEnabled={val => onUpdateRule(currentEntryData.id, { isEnabled: val })} />
                                    <button onClick={() => {}} className="p-2 text-neutral-400 hover:text-white"><EditIcon /></button>
                                    <button onClick={() => {onDeleteRule(currentEntryData.id); setSelectedEntry(null);}} className="p-2 text-neutral-400 hover:text-red-500"><TrashIcon /></button>
                                </div>
                             )}
                        </div>
                        <p className="text-neutral-300 prose prose-invert max-w-none" style={{whiteSpace: 'pre-wrap'}}>{currentEntryData.content}</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-neutral-500 italic">Chọn một mục để xem chi tiết</p>
                    </div>
                )}
            </section>
        </main>
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
