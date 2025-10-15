
import React, { useState, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import WorldInfoForm from './WorldInfoForm';
import CharacterInfoForm from './CharacterInfoForm';
import { WorldCreationState, CustomAttributeDefinition, AttributeType } from '../../types';
import * as WorldPresetService from '../../services/WorldPresetService';
import InitialEntitiesForm from './InitialEntitiesForm';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import CultivationSystemForm from './CultivationSystemForm';
import AttributeSystemForm from './AttributeSystemForm';
import { WorldIcon } from '../icons/WorldIcon';
import { UserIcon } from '../icons/UserIcon';
import { CultivationIcon } from '../icons/CultivationIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';


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

const defaultAttributes: CustomAttributeDefinition[] = [
    // Vital Stats
    { id: 'sinhLucToiDa', name: 'Sinh Lực Tối đa', description: 'Điểm sinh mệnh tối đa của nhân vật.', type: AttributeType.VITAL, icon: '❤️', baseValue: 100, isDefault: true, links: [] },
    { id: 'linhLucToiDa', name: 'Linh Lực Tối đa', description: 'Năng lượng dùng để thi triển kỹ năng.', type: AttributeType.VITAL, icon: '💧', baseValue: 50, isDefault: true, links: [] },
    { id: 'theLucToiDa', name: 'Thể Lực Tối đa', description: 'Năng lượng dùng cho các hành động thể chất.', type: AttributeType.VITAL, icon: '⚡', baseValue: 100, isDefault: true, links: [] },
    { id: 'doNoToiDa', name: 'Độ No Tối đa', description: 'Mức độ no tối đa mà nhân vật có thể đạt được.', type: AttributeType.VITAL, icon: '🍞', baseValue: 100, isDefault: true, links: [] },
    { id: 'doNuocToiDa', name: 'Độ Nước Tối đa', description: 'Mức độ đủ nước tối đa của nhân vật. 100% là đủ, 0% là cực kỳ khát.', type: AttributeType.VITAL, icon: '💧', baseValue: 100, isDefault: true, links: [] },
    // Primary Stats
    { id: 'congKich', name: 'Công Kích', description: 'Sát thương vật lý cơ bản.', type: AttributeType.PRIMARY, icon: '⚔️', baseValue: 10, isDefault: true, links: [] },
    { id: 'phongNgu', name: 'Phòng Ngự', description: 'Khả năng chống chịu sát thương vật lý.', type: AttributeType.PRIMARY, icon: '🛡️', baseValue: 5, isDefault: true, links: [] },
    { id: 'khangPhep', name: 'Kháng Phép', description: 'Khả năng chống chịu sát thương phép.', type: AttributeType.PRIMARY, icon: '💠', baseValue: 5, isDefault: true, links: [] },
    { id: 'thanPhap', name: 'Thân Pháp', description: 'Tốc độ, sự nhanh nhẹn, ảnh hưởng đến thứ tự hành động.', type: AttributeType.PRIMARY, icon: '💨', baseValue: 10, isDefault: true, links: [] },
    // Secondary Stats
    { id: 'chiMang', name: 'Tỉ lệ Chí mạng', description: 'Cơ hội gây sát thương chí mạng (giá trị 0.05 = 5%).', type: AttributeType.PRIMARY, icon: '🎯', baseValue: 0.05, isDefault: true, links: [] },
    { id: 'satThuongChiMang', name: 'ST Chí mạng', description: 'Bội số sát thương khi chí mạng (giá trị 1.5 = 150%).', type: AttributeType.PRIMARY, icon: '💥', baseValue: 1.5, isDefault: true, links: [] },
    { id: 'giamHoiChieu', name: 'Giảm Hồi chiêu', description: 'Tỉ lệ giảm thời gian hồi kỹ năng (giá trị 0.1 = 10%).', type: AttributeType.PRIMARY, icon: '⏳', baseValue: 0, isDefault: true, links: [] },
    // Informational Stats
    { id: 'linh_thach', name: 'Linh Thạch', description: 'Đơn vị tiền tệ chính trong giới tu tiên, chứa đựng linh khí tinh thuần.', type: AttributeType.INFORMATIONAL, icon: '💎', baseValue: 100, isDefault: true, links: [] },
    { id: 'danh_vong', name: 'Danh Vọng', description: 'Thước đo danh tiếng và uy tín của nhân vật trong thiên hạ.', type: AttributeType.INFORMATIONAL, icon: '🌟', baseValue: 0, isDefault: true, links: [] },
    // Hidden Stats
    { id: 'thien_co', name: 'Thiên Cơ', description: 'Một chỉ số ẩn, đại diện cho nghiệp lực và sự ưu ái của thiên đạo. Ảnh hưởng đến các sự kiện may rủi.', type: AttributeType.HIDDEN, icon: '☯️', baseValue: 0, isDefault: true, links: [] }
];

type CreatorView = 'LIST' | 'WORLD' | 'CHARACTER' | 'CULTIVATION' | 'ATTRIBUTES' | 'ENTITIES';


const WorldCreatorScreen: React.FC<WorldCreatorScreenProps> = ({ onBackToMenu, onWorldCreated, settingsHook }) => {
  const [view, setView] = useState<CreatorView>('LIST');
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
    customAttributes: defaultAttributes,
    initialFactions: [],
    initialNpcs: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
            preset.customAttributes = defaultAttributes;
        } else {
            // Hydrate existing attributes with new fields for backward compatibility
            preset.customAttributes = preset.customAttributes.map(attr => ({
                ...{ // Default values for new fields if they don't exist
                    type: AttributeType.INFORMATIONAL, 
                    icon: '❓',
                    baseValue: 0,
                    isDefault: false,
                    links: [],
                },
                ...attr 
            }));
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

        setState(preset);
      } catch (error: any) {
        alert(error.message || "Không thể tải file thiết lập.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };
  
  const menuItems = [
    { id: 'WORLD', label: 'Thế Giới & Cốt Truyện', description: 'Đặt nền móng cho thế giới và câu chuyện của bạn.', Icon: WorldIcon },
    { id: 'CHARACTER', label: 'Thông Tin Nhân Vật', description: 'Kiến tạo linh hồn sẽ khuấy đảo vị diện này.', Icon: UserIcon },
    { id: 'CULTIVATION', label: 'Hệ Thống Cảnh Giới', description: 'Tùy chỉnh hệ thống tu luyện, cấp bậc và sức mạnh.', Icon: CultivationIcon },
    { id: 'ATTRIBUTES', label: 'Hệ Thống Thuộc Tính', description: 'Định nghĩa các tài nguyên đặc biệt như linh thạch, danh vọng.', Icon: SparklesIcon },
    { id: 'ENTITIES', label: 'Thực Thể Ban Đầu', description: 'Xây dựng các thế lực và nhân vật khởi đầu cho thế giới.', Icon: UsersIcon },
  ];
  const currentItem = menuItems.find(item => item.id === view);

  const renderContent = () => {
    switch(view) {
        case 'WORLD': return <WorldInfoForm state={state} setState={setState} settingsHook={settingsHook} />;
        case 'CHARACTER': return <CharacterInfoForm state={state} setState={setState} settingsHook={settingsHook} />;
        case 'CULTIVATION': return <CultivationSystemForm state={state} setState={setState} />;
        case 'ATTRIBUTES': return <AttributeSystemForm state={state} setState={setState} />;
        case 'ENTITIES': return <InitialEntitiesForm state={state} setState={setState} />;
        case 'LIST':
        default:
            return (
                <div className="w-full space-y-3">
                    {menuItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setView(item.id as CreatorView)}
                            className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group border border-transparent hover:bg-white/5 hover:border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                    <item.Icon className="h-6 w-6 text-neutral-400 group-hover:text-white transition-colors"/>
                                </div>
                                <div className="flex-grow text-left">
                                    <p className="font-bold text-lg text-neutral-100">{item.label}</p>
                                    <p className="text-sm text-neutral-400">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-500 transition-transform duration-300 group-hover:text-white group-hover:translate-x-1">
                                <ChevronRightIcon className="h-6 w-6" />
                            </div>
                        </button>
                    ))}
                </div>
            );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
       <style>{`
        @keyframes content-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-content-fade-in {
          animation: content-fade-in 0.5s ease-out forwards;
        }
       `}</style>
      
       <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-4 sm:p-8 flex flex-col">
          <header className="grid grid-cols-[auto_1fr_auto] items-center gap-4 mb-6 flex-shrink-0">
              <div>
                  <button onClick={view === 'LIST' ? onBackToMenu : () => setView('LIST')} className="p-2 rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Quay lại">
                      <ArrowLeftIcon className="h-6 w-6" />
                  </button>
              </div>
              <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 tracking-wider font-rajdhani" style={{textShadow: '0 0 8px rgba(255, 255, 255, 0.4)'}}>
                     {currentItem ? currentItem.label : 'Kiến Tạo Vị Diện'}
                  </h1>
              </div>
              <div className="flex items-center gap-2">
                  <Button onClick={handleSavePreset} variant="secondary" className="!py-2 !px-4 !text-sm !w-auto">Lưu</Button>
                  <Button onClick={triggerFileLoad} variant="secondary" className="!py-2 !px-4 !text-sm !w-auto">Tải</Button>
              </div>
          </header>
        
          <main ref={contentRef} className="flex-grow min-h-0 overflow-y-auto custom-scrollbar pr-4 -mr-4">
            <div className="animate-content-fade-in" key={view}>
              {renderContent()}
            </div>
          </main>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

          <footer className="flex-shrink-0 pt-6 mt-4 border-t border-white/10 flex justify-end items-center">
             {view === 'LIST' ? (
              <Button onClick={handleCreateWorld}>
                Tạo Thế Giới
              </Button>
            ) : (
              <Button onClick={() => setView('LIST')}>
                Hoàn Tất
              </Button>
            )}
          </footer>
      </div>
    </div>
  );
};

export default WorldCreatorScreen;
