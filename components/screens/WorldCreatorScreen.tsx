import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import WorldInfoForm from '../world-creator/WorldInfoForm';
import CharacterInfoForm from '../world-creator/CharacterInfoForm';
import { WorldCreationState, TrainingDataSet } from '../../types';
import * as WorldPresetService from '../../services/WorldPresetService';
import InitialEntitiesForm from '../world-creator/InitialEntitiesForm';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import CultivationSystemForm from '../world-creator/CultivationSystemForm';
import AttributeSystemForm from '../world-creator/AttributeSystemForm';
import WorldRulesForm from '../world-creator/WorldRulesForm';
import { WorldIcon } from '../icons/WorldIcon';
import { UserIcon } from '../icons/UserIcon';
import { CultivationIcon } from '../icons/CultivationIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BrainIcon } from '../icons/BrainIcon';
import { UsersIcon } from '../icons/UsersIcon';
import ChevronIcon from '../icons/ChevronIcon';
import { genericDefaultTemplate } from '../../services/attributeTemplates';
import { DownloadIcon } from '../icons/DownloadIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { LawIcon } from '../icons/LawIcon';
import QuickAssistModal from '../world-creator/QuickAssistModal';
import * as GeminiStorytellerService from '../../services/GeminiStorytellerService';
import { ApiClient } from '../../services/gemini/client';
import * as StorageService from '../../services/StorageService';


interface WorldCreatorScreenProps {
  onBackToMenu: () => void;
  onWorldCreated: (state: WorldCreationState) => void;
  settingsHook: ReturnType<typeof useSettings>;
  onApiKeyInvalid: () => void;
}

const defaultCultivationSystem = {
  systemName: '',
  resourceName: '',
  unitName: '',
  description: '',
  mainTiers: [],
};

const defaultWorldCreationState: WorldCreationState = {
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
    specialRules: [],
    initialLore: [],
    knowledgeBaseId: undefined,
};

type CreatorView = 'WORLD' | 'CHARACTER' | 'CULTIVATION' | 'ATTRIBUTES' | 'RULES' | 'ENTITIES';


const WorldCreatorScreen: React.FC<WorldCreatorScreenProps> = ({ onBackToMenu, onWorldCreated, settingsHook, onApiKeyInvalid }) => {
  const [expandedView, setExpandedView] = useState<CreatorView | null>(null);
  const [state, setState] = useState<WorldCreationState>(defaultWorldCreationState);
  const [isQuickAssistModalOpen, setIsQuickAssistModalOpen] = useState(false);
  const [isKnowledgeAssistModalOpen, setIsKnowledgeAssistModalOpen] = useState(false);
  const [isQuickAssistLoading, setIsQuickAssistLoading] = useState(false);
  const [trainingSets, setTrainingSets] = useState<TrainingDataSet[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { getApiClient, cycleToNextApiKey, apiStats, settings } = settingsHook;
  
  const apiClient: ApiClient = { getApiClient, cycleToNextApiKey, apiStats, onApiKeyInvalid };

  useEffect(() => {
    async function fetchTrainingData() {
        try {
            const sets = await StorageService.getAllTrainingSets();
            setTrainingSets(sets);
        } catch (error) {
            console.error("Failed to fetch training data sets:", error);
        }
    }
    fetchTrainingData();
  }, []);


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
  
  const handleResetPreset = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ thiết lập hiện tại và trở về mặc định không?")) {
        setState(defaultWorldCreationState);
        setExpandedView(null);
    }
  };

  const handleQuickAssist = () => {
    if (!getApiClient()) {
        alert("Dịch vụ AI chưa sẵn sàng hoặc chưa cấu hình API Key.");
        onApiKeyInvalid();
        return;
    }
    setIsQuickAssistModalOpen(true);
  };

    const handleQuickAssistWithKnowledge = () => {
        if (!getApiClient()) {
            alert("Dịch vụ AI chưa sẵn sàng hoặc chưa cấu hình API Key.");
            onApiKeyInvalid();
            return;
        }
        if (!state.knowledgeBaseId) {
            alert("Vui lòng chọn một bộ kiến thức nền trước khi sử dụng chức năng này.");
            return;
        }
        setIsKnowledgeAssistModalOpen(true);
    };

    const handleQuickAssistWithKnowledgeSubmit = async (idea: string) => {
        setIsQuickAssistLoading(true);
        try {
            if (!state.knowledgeBaseId) throw new Error("Knowledge Base ID is missing.");

            const generatedWorld = await GeminiStorytellerService.generateWorldFromPromptWithKnowledge(
                idea,
                state.knowledgeBaseId,
                state.isNsfw,
                apiClient,
                settings.aiModelSettings,
                settings.safety
            );

            setState(prevState => ({
                ...defaultWorldCreationState,
                narrativePerspective: prevState.narrativePerspective,
                isNsfw: prevState.isNsfw,
                knowledgeBaseId: prevState.knowledgeBaseId, // Preserve the selected knowledge base
                ...generatedWorld,
            }));
            
            setExpandedView(null);
            setIsKnowledgeAssistModalOpen(false);

        } catch (error: any) {
            console.error("Error during Knowledge Quick Assist:", error);
            alert("Đã xảy ra lỗi khi tạo thế giới nhanh bằng tri thức nền. Vui lòng thử lại.\n\nChi tiết: " + error.message);
        } finally {
            setIsQuickAssistLoading(false);
        }
    };
  
  const handleQuickAssistSubmit = async (idea: string) => {
    setIsQuickAssistLoading(true);
    try {
        const generatedWorld = await GeminiStorytellerService.generateWorldFromPrompt(
            idea,
            state.isNsfw,
            apiClient,
            settings.aiModelSettings,
            settings.safety
        );

        setState(prevState => ({
            ...defaultWorldCreationState,
            narrativePerspective: prevState.narrativePerspective,
            isNsfw: prevState.isNsfw,
            ...generatedWorld,
        }));
        
        setExpandedView(null);
        setIsQuickAssistModalOpen(false);

    } catch (error: any) {
        console.error("Error during Quick Assist:", error);
        alert("Đã xảy ra lỗi khi tạo thế giới nhanh. Vui lòng thử lại.\n\nChi tiết: " + error.message);
    } finally {
        setIsQuickAssistLoading(false);
    }
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
        if (!preset.specialRules) {
            preset.specialRules = [];
        }
        if (!preset.initialLore) {
            preset.initialLore = [];
        }
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
    { id: 'RULES', label: 'Quy Luật Thế Giới', description: 'Thiết lập các định luật vật lý, ma pháp và xã hội riêng.', Icon: LawIcon },
    { id: 'ENTITIES', label: 'Thực Thể Ban Đầu', description: 'Xây dựng các thế lực và nhân vật khởi đầu cho thế giới.', Icon: UsersIcon },
  ];

  const getFormComponent = (viewId: CreatorView) => {
    switch(viewId) {
        case 'WORLD': return <WorldInfoForm state={state} setState={setState} apiClient={apiClient} settings={settings} trainingSets={trainingSets} />;
        case 'CHARACTER': return <CharacterInfoForm state={state} setState={setState} apiClient={apiClient} settings={settings} />;
        case 'CULTIVATION': return <CultivationSystemForm state={state} setState={setState} />;
        case 'ATTRIBUTES': return <AttributeSystemForm state={state} setState={setState} />;
        case 'RULES': return <WorldRulesForm state={state} setState={setState} />;
        case 'ENTITIES': return <InitialEntitiesForm state={state} setState={setState} />;
        default: return null;
    }
  }
  
  const CreatorActionButton: React.FC<{onClick: () => void; label: string; Icon: React.FC<{className?: string}>; title: string; disabled?: boolean;}> = ({onClick, label, Icon, title, disabled = false}) => (
        <button 
            onClick={onClick} 
            title={title}
            disabled={disabled}
            className="flex flex-col items-center justify-center gap-2 w-24 h-24 bg-black/20 rounded-2xl border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
        >
            <Icon className="h-7 w-7" />
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 md:p-8">
       <style>{`
        @keyframes content-fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
          animation: content-fade-in 0.4s ease-out forwards;
        }
       `}</style>
      
       <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-4 sm:p-8 flex flex-col">
          <header className="flex justify-between items-center mb-4 flex-shrink-0">
              <button onClick={onBackToMenu} className="p-2 rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Quay lại">
                  <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <h2 className="text-3xl font-rajdhani font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Thiết lập Thế giới
              </h2>
              <div className="w-10 h-10"></div> {/* Spacer to balance layout */}
          </header>

          <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-3 mb-6">
            <CreatorActionButton onClick={handleSavePreset} label="Lưu" Icon={DownloadIcon} title="Lưu thiết lập hiện tại ra file" />
            <CreatorActionButton onClick={triggerFileLoad} label="Tải" Icon={UploadIcon} title="Tải thiết lập từ file" />
            <CreatorActionButton onClick={handleResetPreset} label="Xóa" Icon={TrashIcon} title="Xóa và đặt lại toàn bộ thiết lập"/>
            <CreatorActionButton onClick={handleQuickAssist} label="AI Hỗ Trợ" Icon={SparklesIcon} title="Sử dụng AI để tạo nhanh thế giới"/>
            <CreatorActionButton onClick={handleQuickAssistWithKnowledge} label="AI Hỗ trợ (Tri thức)" Icon={BrainIcon} title="Sử dụng AI và kiến thức nền để tạo thế giới" disabled={!state.knowledgeBaseId} />
          </div>
        
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
       <QuickAssistModal 
            isOpen={isQuickAssistModalOpen}
            onClose={() => setIsQuickAssistModalOpen(false)}
            onSubmit={handleQuickAssistSubmit}
            isLoading={isQuickAssistLoading}
        />
        <QuickAssistModal 
            isOpen={isKnowledgeAssistModalOpen}
            onClose={() => setIsKnowledgeAssistModalOpen(false)}
            onSubmit={handleQuickAssistWithKnowledgeSubmit}
            isLoading={isQuickAssistLoading}
            title="AI Hỗ Trợ (Tri Thức)"
        />
    </div>
  );
};

export default WorldCreatorScreen;