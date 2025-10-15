
import React, { useState } from 'react';
import { GameState, NPC } from '../../types';
import NpcCodex from './NpcCodex';
import ChroniclePanel from './ChroniclePanel';
import { UsersIcon } from '../icons/UsersIcon';
import { ChronicleIcon } from '../icons/ChronicleIcon';
import { FactionIcon } from '../icons/FactionIcon';
import { LocationIcon } from '../icons/LocationIcon';

interface CodexPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onNpcClick: (npc: NPC) => void;
}

type CodexTab = 'npcs' | 'chronicle' | 'factions' | 'locations';

const CodexPanel: React.FC<CodexPanelProps> = ({ isOpen, onClose, gameState, onNpcClick }) => {
  const [activeTab, setActiveTab] = useState<CodexTab>('npcs');

  if (!isOpen) return null;

  const TabButton: React.FC<{ tabId: CodexTab; icon: React.ReactNode; label: string }> = ({ tabId, icon, label }) => {
    const isActive = activeTab === tabId;
    return (
      <button
        onClick={() => setActiveTab(tabId)}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white ${
          isActive
            ? 'text-white bg-neutral-700'
            : 'text-neutral-400 bg-neutral-900/50 hover:bg-neutral-800'
        }`}
        title={label}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-30 flex justify-center items-center p-0 lg:justify-end lg:p-4" onClick={onClose}>
      <div
        className="h-full w-full bg-neutral-900 flex flex-col lg:h-auto lg:max-h-[95vh] lg:w-full lg:max-w-md lg:rounded-2xl lg:border lg:border-solid lg:border-neutral-700 lg:shadow-2xl lg:bg-neutral-900/95 lg:backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 flex justify-between items-center border-b-2 border-neutral-800">
          <h2 className="text-2xl font-bold text-white font-rajdhani">Sổ Tay</h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-shrink-0 flex overflow-hidden border-b-2 border-neutral-800">
          <TabButton tabId="npcs" icon={<UsersIcon />} label="Nhân Vật" />
          <TabButton tabId="chronicle" icon={<ChronicleIcon />} label="Biên Niên Sử" />
          <TabButton tabId="factions" icon={<FactionIcon />} label="Thế Lực" />
          <TabButton tabId="locations" icon={<LocationIcon />} label="Địa Danh" />
        </div>

        <div className="flex-grow min-h-0">
          <div style={{ display: activeTab === 'npcs' ? 'block' : 'none' }} className="h-full">
            <NpcCodex npcs={gameState.npcs} onNpcClick={onNpcClick} />
          </div>
          <div style={{ display: activeTab === 'chronicle' ? 'block' : 'none' }} className="h-full">
            <ChroniclePanel history={gameState.chronicle} />
          </div>
          <div style={{ display: activeTab === 'factions' ? 'flex' : 'none' }} className="h-full items-center justify-center">
            <p className="text-neutral-500 italic">Chức năng đang được phát triển.</p>
          </div>
          <div style={{ display: activeTab === 'locations' ? 'flex' : 'none' }} className="h-full items-center justify-center">
             <p className="text-neutral-500 italic">Chức năng đang được phát triển.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodexPanel;
