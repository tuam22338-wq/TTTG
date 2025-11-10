import React, { useState, useMemo, useEffect } from 'react';
import { GameState, NPC, WorldRule, StatType, CharacterStat, Item } from '../../types';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';
import { BookIcon } from '../icons/BookIcon';
import { LawIcon } from '../icons/LawIcon';
import { UserIcon } from '../icons/UserIcon';
import { PackageIcon } from '../icons/PackageIcon';
import NpcCodex from './NpcCodex';
import ItemTooltip from './ItemTooltip';
import { allPredefinedItems } from '../../services/predefinedItems';


interface CodexPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onUpdateRule: (ruleId: string, updatedRule: Partial<WorldRule>) => void;
  onAddRule: (newRule: Omit<WorldRule, 'id'>) => void;
  onDeleteRule: (ruleId: string) => void;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'npc', ownerId: string) => void;
}

type CodexTab = 'npcs' | 'lore' | 'rules' | 'items';
type SelectedEntry = { type: CodexTab, id: string };

const CodexPanel: React.FC<CodexPanelProps> = ({ isOpen, onClose, gameState, onUpdateRule, onAddRule, onDeleteRule, onStatClick }) => {
  const [activeTab, setActiveTab] = useState<CodexTab>('npcs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SelectedEntry | null>(null);

  useEffect(() => {
      if(isOpen) {
          setSearchTerm('');
          setSelectedEntry(null);
          setActiveTab('npcs');
      }
  }, [isOpen]);

  const allLore = useMemo(() => [
    ...gameState.worldContext.initialLore,
    ...gameState.codex,
  ].sort((a,b) => a.name.localeCompare(b.name)), [gameState.worldContext.initialLore, gameState.codex]);
  
  const allItems = useMemo(() => [...allPredefinedItems].sort((a,b) => a.name.localeCompare(b.name)), []);

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
    ).sort((a,b) => a.name.localeCompare(b.name)), [gameState.worldContext.specialRules, searchTerm]
  );

  const filteredNpcs = useMemo(() =>
      gameState.npcs.filter(npc =>
          npc.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name)),
      [gameState.npcs, searchTerm]
  );
  
  const filteredItems = useMemo(() => 
    allItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allItems, searchTerm]
  );
  
  const currentEntryData = useMemo(() => {
      if (!selectedEntry) return null;
      let source;
      switch(selectedEntry.type) {
          case 'lore': source = allLore; break;
          case 'rules': source = gameState.worldContext.specialRules; break;
          case 'npcs': source = gameState.npcs; break;
          case 'items': source = allItems; break;
          default: return null;
      }
      return source.find(item => item.id === selectedEntry.id) || null;
  }, [selectedEntry, allLore, gameState.worldContext.specialRules, gameState.npcs, allItems]);

  const handleSelectEntry = (type: CodexTab, id: string) => {
      setSelectedEntry({ type, id });
  };
  
  const NavButton: React.FC<{ tabId: CodexTab, icon: React.ReactNode, label: string }> = ({ tabId, icon, label }) => {
    const isActive = activeTab === tabId;
    return (
      <button
        onClick={() => {
            setActiveTab(tabId);
            setSelectedEntry(null);
            setSearchTerm('');
        }}
        className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 aspect-square ${
          isActive ? 'neumorphic-concave bg-pink-900/30 text-white' : 'text-neutral-400 hover:bg-white/5'
        }`}
        title={label}
      >
        <div className="h-7 w-7">{icon}</div>
        <span className="text-xs mt-1 font-semibold">{label}</span>
      </button>
    );
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 p-4 animate-fade-in-fast" onClick={onClose}>
      <div
        className="relative w-full h-full bg-[var(--bg-panel)] rounded-2xl border border-neutral-700 shadow-2xl flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nav Column */}
        <nav className="w-24 flex-shrink-0 bg-black/20 border-r border-neutral-700/50 p-3 flex flex-col items-center gap-3">
            <NavButton tabId="npcs" label="Nhân Mạch" icon={<UserIcon className="h-full w-full"/>} />
            <NavButton tabId="lore" label="Bách Khoa" icon={<BookIcon className="h-full w-full"/>} />
            <NavButton tabId="rules" label="Quy Luật" icon={<LawIcon className="h-full w-full"/>} />
            <NavButton tabId="items" label="Vật Phẩm" icon={<PackageIcon className="h-full w-full"/>} />
        </nav>

        {/* List & Detail for NPCs is handled by NpcCodex component */}
        {activeTab === 'npcs' ? (
          <NpcCodex npcs={gameState.npcs} onStatClick={onStatClick} />
        ) : (
          <>
            {/* List Column for other tabs */}
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
                    <div className="space-y-1">
                        {activeTab === 'lore' && filteredLore.map(entry => (
                             <button key={entry.id} onClick={() => handleSelectEntry('lore', entry.id)} className={`w-full text-left p-3 rounded-lg transition-colors duration-200 relative overflow-hidden ${selectedEntry?.id === entry.id ? 'bg-pink-900/40' : 'hover:bg-neutral-800/60'}`}>
                                {selectedEntry?.id === entry.id && <div className="absolute left-0 top-0 h-full w-1 bg-pink-400"></div>}
                                <p className={`font-bold truncate pl-2 ${selectedEntry?.id === entry.id ? 'text-pink-300' : 'text-neutral-200'}`}>{entry.name || '(Chưa có tên)'}</p>
                            </button>
                        ))}
                        {activeTab === 'rules' && filteredRules.map(entry => (
                             <button key={entry.id} onClick={() => handleSelectEntry('rules', entry.id)} className={`w-full text-left p-3 rounded-lg transition-colors duration-200 relative overflow-hidden ${selectedEntry?.id === entry.id ? 'bg-pink-900/40' : 'hover:bg-neutral-800/60'}`}>
                                {selectedEntry?.id === entry.id && <div className="absolute left-0 top-0 h-full w-1 bg-pink-400"></div>}
                                <p className={`font-bold truncate pl-2 ${selectedEntry?.id === entry.id ? 'text-pink-300' : 'text-neutral-200'}`}>{entry.name || '(Chưa có tên)'}</p>
                            </button>
                        ))}
                        {activeTab === 'items' && filteredItems.map(item => (
                             <button key={item.id} onClick={() => handleSelectEntry('items', item.id)} className={`w-full text-left p-3 rounded-lg transition-colors duration-200 relative overflow-hidden ${selectedEntry?.id === item.id ? 'bg-pink-900/40' : 'hover:bg-neutral-800/60'}`}>
                                {selectedEntry?.id === item.id && <div className="absolute left-0 top-0 h-full w-1 bg-pink-400"></div>}
                                <p className={`font-bold truncate pl-2 ${selectedEntry?.id === item.id ? 'text-pink-300' : 'text-neutral-200'}`}>{item.name}</p>
                            </button>
                        ))}
                    </div>
                 </div>
            </aside>

            {/* Detail Column for other tabs */}
            <main className="flex-grow p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                 {!currentEntryData ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                        <BookIcon className="h-24 w-24" />
                        <p className="mt-4 text-lg font-semibold">Chọn một mục để xem chi tiết</p>
                    </div>
                ) : selectedEntry?.type === 'items' ? (
                     <div className="animate-fade-in-fast">
                        <ItemTooltip item={currentEntryData as Item} />
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in-fast">
                        <h2 className="text-4xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            {(currentEntryData as WorldRule).name}
                        </h2>
                        <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed text-lg whitespace-pre-wrap">{(currentEntryData as WorldRule).content}</div>
                    </div>
                )}
            </main>
          </>
        )}
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <style>{`
          .animate-fade-in-fast { animation: fadeIn 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CodexPanel;