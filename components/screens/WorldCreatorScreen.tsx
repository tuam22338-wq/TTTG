import React, { useState, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import WorldInfoForm from '../world-creator/WorldInfoForm';
import CharacterInfoForm from '../world-creator/CharacterInfoForm';
import { WorldCreationState } from '../../types';
import * as WorldPresetService from '../../services/WorldPresetService';
import InitialEntitiesForm from '../world-creator/InitialEntitiesForm';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import CultivationSystemForm from '../world-creator/CultivationSystemForm';
import AttributeSystemForm from '../world-creator/AttributeSystemForm';
import { WorldIcon } from '../icons/WorldIcon';
import { UserIcon } from '../icons/UserIcon';
import { CultivationIcon } from '../icons/CultivationIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UsersIcon } from '../icons/UsersIcon';
import ChevronIcon from '../icons/ChevronIcon';
import { genericDefaultTemplate } from '../../services/attributeTemplates';


interface WorldCreatorScreenProps {
  onBackToMenu: () => void;
  onWorldCreated: (state: WorldCreationState) => void;
  settingsHook: ReturnType<typeof useSettings>;
}

const defaultCultivationSystem = {
  systemName: '',
  resourceName: '',
  unitName: '',
  description: '',
  mainTiers: [],
};

type CreatorView = 'WORLD' | 'CHARACTER' | 'CULTIVATION' | 'ATTRIBUTES' | 'ENTITIES';


const WorldCreatorScreen: React.FC<WorldCreatorScreenProps> = ({ onBackToMenu, onWorldCreated, settingsHook }) => {
  const [expandedView, setExpandedView] = useState<CreatorView | null>(null);
  const [state, setState] = useState<WorldCreationState>({
    genre: '',
    description: '',
    isNsfw: true,
    narrativePerspective: 'Nhãn Quan Toàn Tri',
    character: {
      name: '',
      gender: 'Nam',
      customGender: '',
      personality: '',
      biography: '',
      skills: [],
    },
    isCultivationEnabled: true,
    cultivationSystem: defaultCultivationSystem,
    customAttributes: genericDefaultTemplate.attributes,
    initialFactions: [],
    initialNpcs: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggleView = (viewId: CreatorView) => {
    setExpandedView(prev => (prev === viewId ? null : viewId));
    if (contentRef.current) {
        // We delay scroll to allow the element to render and get its position
        setTimeout(() => {
            const element = document.getElementById(`accordion-item-${viewId}`);
            if (element && contentRef.current) {
                const topPos = element.offsetTop - contentRef.current.offsetTop;
                contentRef.current.scrollTo({ top: topPos, behavior: 'smooth' });
            }
        }, 100);
    }
  };


  const handleCreateWorld = () => {
    onWorldCreated(state);
  };

  const handleSavePreset = () => {
    WorldPresetService.savePresetToFile(state);
  };

  const triggerFileLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const preset = await WorldPresetService.loadPresetFromFile(file);
        
        // --- Start Migration & Hydration for older presets ---
        if ((preset as any).cultivationDifficulty) {
          delete (preset as any).cultivationDifficulty;
        }
        if (preset.isCultivationEnabled === undefined) {
          preset.isCultivationEnabled = true;
        }
        if (!preset.cultivationSystem) {
          preset.cultivationSystem = defaultCultivationSystem;
        }
        if (!preset.customAttributes) {
            preset.customAttributes = genericDefaultTemplate.attributes;
        }
        if (!preset.initialFactions) {
            preset.initialFactions = [];
        }
        if (!preset.initialNpcs) {
            preset.initialNpcs = [];
        }
        preset.initialFactions.forEach(f => {
            if ((f as any).description === undefined) {
                (f as any).description = '';
            }
        });
        // --- End Migration ---

        setState(preset);
        setExpandedView(null); // Collapse all sections after loading
      } catch (error: any) {
        alert(error.message || "Không thể tải file thiết lập.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };
  
  const menuItems: { id: CreatorView; label: string; description: string; Icon: React.FC<{className?: string}> }[] = [
    { id: 'WORLD', label: 'Thế Giới & Cốt Truyện', description: 'Đặt nền móng cho thế giới và câu chuyện của bạn.', Icon: WorldIcon },
    { id: 'CHARACTER', label: 'Thông Tin Nhân Vật', description: 'Kiến tạo linh hồn sẽ khuấy đảo vị diện này.', Icon: UserIcon },
    { id: 'CULTIVATION', label: 'Hệ Thống Cảnh Giới', description: 'Tùy chỉnh hệ thống tu luyện, cấp bậc và sức mạnh.', Icon: CultivationIcon },
    { id: 'ATTRIBUTES', label: 'Hệ Thống Thuộc Tính', description: 'Định nghĩa các tài nguyên đặc biệt như linh thạch, danh vọng.', Icon: SparklesIcon },
    { id: 'ENTITIES', label: 'Thực Thể Ban Đầu', description: 'Xây dựng các thế lực và nhân vật khởi đầu cho thế giới.', Icon: UsersIcon },
  ];

  const getFormComponent = (viewId: CreatorView) => {
    switch(viewId) {
        case 'WORLD': return <WorldInfoForm state={state} setState={setState} settingsHook={settingsHook} />;
        case 'CHARACTER': return <CharacterInfoForm state={state} setState={setState} settingsHook={settingsHook} />;
        case 'CULTIVATION': return <CultivationSystemForm state={state} setState={setState} />;
        case 'ATTRIBUTES': return <AttributeSystemForm state={state} setState={setState} />;
        case 'ENTITIES': return <InitialEntitiesForm state={state} setState={setState} />;
        default: return null;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
       <style>{`
        @keyframes content-fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: content-fade-in 0.4s ease-out forwards;
        }
       `}</style>
      
       <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-4 sm:p-8 flex flex-col">
          <header className="grid grid-cols-[auto_1fr_auto] items-center gap-4 mb-6 flex-shrink-0">
              <div>
                  <button onClick={onBackToMenu} className="p-2 rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Quay lại">
                      <ArrowLeftIcon className="h-6 w-6" />
                  </button>
              </div>
              <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 tracking-wider font-rajdhani" style={{textShadow: '0 0 8px rgba(255, 255, 255, 0.4)'}}>
                     Kiến Tạo Vị Diện
                  </h1>
              </div>
              <div className="flex items-center gap-2">
                  <Button onClick={handleSavePreset} variant="secondary" className="!py-2 !px-4 !text-sm !w-auto">Lưu</Button>
                  <Button onClick={triggerFileLoad} variant="secondary" className="!py-2 !px-4 !text-sm !w-auto">Tải</Button>
              </div>
          </header>
        
          <main ref={contentRef} className="flex-grow min-h-0 overflow-y-auto custom-scrollbar pr-4 -mr-4">
             <div className="w-full space-y-3">
                    {menuItems.map((item) => {
                        const isExpanded = expandedView === item.id;
                        return (
                             <div key={item.id} id={`accordion-item-${item.id}`} className="bg-black/20 rounded-xl border border-white/10 overflow-hidden transition-all duration-300">
                                <button 
                                    onClick={() => handleToggleView(item.id as CreatorView)}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg border border-white/10">
                                            <item.Icon className="h-6 w-6 text-neutral-400"/>
                                        </div>
                                        <div className="flex-grow text-left">
                                            <p className="font-bold text-lg text-neutral-100">{item.label}</p>
                                            {!isExpanded && <p className="text-sm text-neutral-400 mt-1">{item.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-500">
                                        <ChevronIcon isExpanded={isExpanded} className="h-8 w-8" />
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="p-4 border-t border-white/10 animate-fade-in-fast">
                                        {getFormComponent(item.id as CreatorView)}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
          </main>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

          <footer className="flex-shrink-0 pt-6 mt-4 border-t border-white/10 flex justify-end items-center">
            <Button onClick={handleCreateWorld}>
                Tạo Thế Giới
            </Button>
          </footer>
      </div>
    </div>
  );
};

export default WorldCreatorScreen;