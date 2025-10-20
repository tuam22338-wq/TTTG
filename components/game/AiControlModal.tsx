import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ToggleSwitch from '../ui/ToggleSwitch';
import { AiSettings, LustModeFlavor, NpcMindset, DestinyCompassMode, NPC, EntityTarget, StatAction, StatScopes, StatTypeGroup } from '../../types';
import { CrownIcon, IntertwinedHeartsIcon, CollarIcon, MaskIcon, LightningIcon, IronWillIcon, TornMindIcon, PrimalInstinctIcon, SeductionIcon, HedonisticIcon, DefaultMindIcon } from '../icons/LustIcons';
import { ConscienceIcon } from '../icons/ConscienceIcon';
import TextareaField from '../ui/TextareaField';
import InputField from '../ui/InputField';

interface AiControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiSettings: AiSettings | undefined;
  onSettingsChange: (newSettings: Partial<AiSettings>) => void;
  isLoading: boolean;
  npcs: NPC[];
  onExecuteEntityAction: (target: EntityTarget, action: StatAction, scopes: StatScopes, directive?: string, newPersonality?: string) => void;
}

type Tab = 'behavior' | 'advanced';

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const TabButton: React.FC<{ tabId: Tab; currentTab: Tab; onClick: (tabId: Tab) => void; children: React.ReactNode }> = ({ tabId, currentTab, onClick, children }) => {
    const isActive = tabId === currentTab;
    return (
        <button
            onClick={() => onClick(tabId)}
            className={`flex-1 py-3 text-sm sm:text-base font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                isActive 
                    ? 'text-white bg-[#e02585] shadow-[0_0_8px_rgba(224,37,133,0.5)]' 
                    : 'text-[#a08cb6] bg-black/20 hover:bg-white/10'
            }`}
        >
            {children}
        </button>
    );
};

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-3 sm:p-4 bg-[#120c18]/50 rounded-lg border border-[#3a2d47]">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 font-rajdhani uppercase tracking-wider">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const LUST_FLAVOR_CONFIG: { flavor: LustModeFlavor; label: string; Icon: React.FC }[] = [
    { flavor: 'DOMINATION', label: 'Thống Trị', Icon: CrownIcon },
    { flavor: 'HARMONY', label: 'Đồng Điệu', Icon: IntertwinedHeartsIcon },
    { flavor: 'SUBMISSION', label: 'Phục Tùng', Icon: CollarIcon },
    { flavor: 'TEASING', label: 'Trêu Ghẹo', Icon: MaskIcon },
    { flavor: 'SEDUCTION', label: 'Quyến Rũ', Icon: SeductionIcon },
    { flavor: 'AI_FREESTYLE', label: 'AI Tự Do', Icon: LightningIcon },
];

const LUST_MODE_DESCRIPTIONS: Record<LustModeFlavor, string> = {
    DOMINATION: "AI sẽ diễn giải mọi hành động theo hướng thống trị và chiếm hữu. Người chơi sẽ là người chủ động tuyệt đối.",
    HARMONY: "AI sẽ tạo ra một cảnh ân ái nồng cháy và ngang hàng, nơi cả hai đều chủ động và hòa quyện.",
    SUBMISSION: "Vai vế bị đảo ngược. NPC sẽ là người chủ động thống trị và dẫn dắt người chơi.",
    TEASING: "Tập trung vào màn dạo đầu và sự khêu gợi. AI sẽ xây dựng khao khát đến tột đỉnh nhưng chưa đi đến hành vi cuối cùng.",
    SEDUCTION: "NPC sẽ chủ động quyến rũ và khiêu khích, dẫn dắt người chơi vào một cuộc rượt đuổi tình ái.",
    AI_FREESTYLE: "AI sẽ tự do sáng tạo diễn biến dựa trên tính cách nhân vật và bối cảnh, có thể tạo ra những bất ngờ."
};

const NPC_MINDSET_CONFIG: Record<NpcMindset, { displayName: string; Icon: React.FC; description: string; color: string; }> = {
    DEFAULT: { displayName: "Mặc Định", Icon: DefaultMindIcon, description: "NPC hành động hoàn toàn dựa trên tính cách và mối quan hệ sẵn có.", color: "text-gray-300" },
    PRIMAL_INSTINCT: { displayName: "Bản Năng", Icon: PrimalInstinctIcon, description: "Lý trí NPC dễ dàng bị bản năng lấn át.", color: "text-red-400" },
    TORN_MIND: { displayName: "Giằng Xé", Icon: TornMindIcon, description: "NPC đấu tranh nội tâm giữa lý trí và bản năng.", color: "text-purple-400" },
    IRON_WILL: { displayName: "Sắt Đá", Icon: IronWillIcon, description: "NPC sẽ kháng cự quyết liệt theo cách phù hợp với tính cách.", color: "text-cyan-400" },
    HEDONISTIC_MIND: { displayName: "Khoái Lạc", Icon: HedonisticIcon, description: "NPC hoàn toàn tỉnh táo và chủ động tận hưởng khoái lạc.", color: "text-pink-400" },
};

const MINDSET_CYCLE: NpcMindset[] = ['DEFAULT', 'PRIMAL_INSTINCT', 'TORN_MIND', 'IRON_WILL', 'HEDONISTIC_MIND'];

const DESTINY_COMPASS_CONFIG: Record<DestinyCompassMode, { displayName: string; description: string; colors: string }> = {
    NORMAL: { displayName: 'Bình Thường', description: 'Trải nghiệm cân bằng, tăng trưởng hợp lý.', colors: 'bg-green-600/80 border-green-400 text-white' },
    HARSH: { displayName: 'Khắc Nghiệt', description: 'Thử thách cao, thường có sự kiện bất lợi.', colors: 'bg-yellow-600/80 border-yellow-400 text-white' },
    HELLISH: { displayName: 'Nghịch Thiên', description: 'Địa ngục trần gian, cả thế giới chống lại bạn.', colors: 'bg-red-700/80 border-red-500 text-white' },
};

const OffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


const AiControlModal: React.FC<AiControlModalProps> = ({ isOpen, onClose, aiSettings, onSettingsChange, isLoading, npcs, onExecuteEntityAction }) => {
    const [activeTab, setActiveTab] = useState<Tab>('behavior');
    
    // State for Entity Control Panel
    const [target, setTarget] = useState<EntityTarget>('PLAYER');
    const [action, setAction] = useState<StatAction>('DELETE');
    const [scopes, setScopes] = useState<StatScopes>({ REGULAR: false, KNOWLEDGE: false });
    const [reconstructionDirective, setReconstructionDirective] = useState('');
    const [newPersonality, setNewPersonality] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const isTargetingSpecificNpc = target !== 'PLAYER' && target !== 'ALL_NPCS' && target !== 'PLAYER_AND_ALL_NPCS';

    useEffect(() => {
        if (action !== 'RECONSTRUCT') {
            setReconstructionDirective('');
        }
        if (action !== 'RECONSTRUCT' || !isTargetingSpecificNpc) {
            setNewPersonality('');
        }
    }, [action, target, isTargetingSpecificNpc]);

    useEffect(() => {
        if (activeTab !== 'advanced') return;
        
        if (action === 'SANITIZE') {
             setInfoMessage(`Hành động này sẽ yêu cầu AI **VIẾT LẠI TOÀN BỘ** thuộc tính và biên niên sử của game sang ngôn ngữ trung tính (SFW) để "lách" bộ lọc an toàn. <strong>Bạn nên sao lưu game trước khi thực hiện.</strong>`);
             return;
        }

        let targetName = "Lỗi";
        if (target === 'PLAYER') {
            targetName = "Nhân vật chính";
        } else if (target === 'ALL_NPCS') {
            targetName = "TẤT CẢ NPC";
        } else if (target === 'PLAYER_AND_ALL_NPCS') {
            targetName = "Tất cả thực thể (PC & NPC)";
        } else {
            const npc = npcs.find(n => n.id === target);
            targetName = npc ? `NPC ${npc.name}` : "NPC không xác định";
        }

        if (action === 'RECONSTRUCT') {
            setInfoMessage(`Hành động này sẽ yêu cầu AI **THIẾT KẾ LẠI TOÀN BỘ** trạng thái của **${targetName}** dựa trên lịch sử và chỉ thị của bạn. Toàn bộ thuộc tính hiện tại sẽ bị xóa và thay thế.`);
            return;
        }

        const actionText = action === 'DELETE' 
            ? "sẽ **XÓA VĨNH VIỄN**" 
            : "sẽ yêu cầu AI **TINH GỌN LẠI**";
        
        const scopeKeys = Object.keys(scopes).filter(k => scopes[k as keyof StatScopes]) as (keyof StatScopes)[];
        if (scopeKeys.length === 0) {
            setInfoMessage("Vui lòng chọn ít nhất một phạm vi để thực hiện.");
            return;
        }

        const scopeTranslations: Record<keyof StatScopes, string> = {
            REGULAR: 'Trạng thái thông thường',
            KNOWLEDGE: 'Tri thức/Nhận thức'
        };
        const scopeText = scopeKeys.map(k => scopeTranslations[k]).join(', ');

        const message = `Hành động này ${actionText} các loại thuộc tính sau: **[${scopeText}]** của **${targetName}**. Hành động tinh gọn có thể mất nhiều thời gian.`;
        setInfoMessage(message);

    }, [target, action, scopes, npcs, activeTab]);

    const handleScopeChange = (scope: StatTypeGroup) => {
        setScopes(prev => ({...prev, [scope]: !prev[scope]}));
    };
    
    const handleExecute = () => {
        if (action === 'SANITIZE') {
            onExecuteEntityAction('PLAYER_AND_ALL_NPCS', 'SANITIZE', { REGULAR: true, KNOWLEDGE: true });
        } else {
            onExecuteEntityAction(target, action, scopes, reconstructionDirective, newPersonality);
        }
        onClose();
    };

    if (!isOpen || !aiSettings) return null;

    const currentMindsetConfig = NPC_MINDSET_CONFIG[aiSettings.npcMindset];

    const LUST_FLAVOR_CONFIG_WITH_OFF: { flavor: LustModeFlavor | null; label: string; Icon: React.FC }[] = [
        { flavor: null, label: 'Bình Thường', Icon: OffIcon },
        ...LUST_FLAVOR_CONFIG
    ];

    const handleMindsetChange = () => {
        const currentIndex = MINDSET_CYCLE.indexOf(aiSettings.npcMindset);
        const nextIndex = (currentIndex + 1) % MINDSET_CYCLE.length;
        onSettingsChange({ npcMindset: MINDSET_CYCLE[nextIndex] });
    };

    const scopeOptions: { key: StatTypeGroup, label: string }[] = [
        { key: 'REGULAR', label: 'Trạng thái' },
        { key: 'KNOWLEDGE', label: 'Tri thức/Nhận thức' }
    ];
    
    const handleRuleChange = (index: number, value: string) => {
        const newMandates = [...aiSettings.authorsMandate];
        newMandates[index] = value;
        onSettingsChange({ authorsMandate: newMandates });
    };

    const handleAddRule = () => {
        onSettingsChange({ authorsMandate: [...aiSettings.authorsMandate, ''] });
    };

    const handleRemoveRule = (index: number) => {
        const newMandates = aiSettings.authorsMandate.filter((_, i) => i !== index);
        onSettingsChange({ authorsMandate: newMandates });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bảng Điều Khiển AI">
            <div className="flex-shrink-0 flex overflow-hidden rounded-t-lg border-b-2 border-[#e02585]">
                <TabButton tabId="behavior" currentTab={activeTab} onClick={setActiveTab}>Hành Vi</TabButton>
                <TabButton tabId="advanced" currentTab={activeTab} onClick={setActiveTab}>Bảng Điều Khiển Thực Thể</TabButton>
            </div>
            <div className="py-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {activeTab === 'behavior' && (
                    <div className="space-y-4 sm:space-y-6">
                        <ControlSection title="Thiên Mệnh Tác Giả">
                            <div className="space-y-2">
                                {aiSettings.authorsMandate.map((rule, index) => (
                                     <div key={index} className="flex items-center gap-2">
                                        <span className="text-gray-400 font-mono text-sm">{index + 1}.</span>
                                        <InputField
                                            id={`mandate-${index}`}
                                            placeholder="VD: Nhân vật chính không bao giờ nói dối."
                                            value={rule}
                                            onChange={(e) => handleRuleChange(index, e.target.value)}
                                            disabled={isLoading}
                                            className="!py-2 flex-grow"
                                        />
                                        <button 
                                            onClick={() => handleRemoveRule(index)}
                                            disabled={isLoading}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50"
                                            aria-label={`Xóa quy tắc ${index + 1}`}
                                        >
                                            <TrashIcon />
                                        </button>
                                     </div>
                                ))}
                            </div>
                            <Button onClick={handleAddRule} variant="secondary" disabled={isLoading} className="w-full !text-sm !py-2">
                                + Thêm Quy Tắc
                            </Button>
                            <p className="text-xs text-[#a08cb6] -mt-2">Các quy tắc này được lưu lại và có độ ưu tiên cao, buộc AI phải tuân thủ. Chia nhỏ các quy tắc sẽ giúp AI hiểu rõ hơn.</p>
                        </ControlSection>

                        <ControlSection title="La Bàn Định Mệnh">
                             <div>
                                <p className="text-xs text-[#a08cb6] -mt-2 mb-2">Điều chỉnh độ khó và các sự kiện ngẫu nhiên của thế giới.</p>
                                <div className="grid grid-cols-3 gap-2 bg-black/20 p-1 rounded-lg">
                                    {Object.keys(DESTINY_COMPASS_CONFIG).map((mode) => {
                                        const config = DESTINY_COMPASS_CONFIG[mode as DestinyCompassMode];
                                        const isActive = aiSettings.destinyCompassMode === mode;
                                        return (
                                            <button
                                                key={mode}
                                                onClick={() => onSettingsChange({ destinyCompassMode: mode as DestinyCompassMode })}
                                                disabled={isLoading}
                                                title={config.description}
                                                className={`px-2 py-1.5 text-xs font-bold rounded-md transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    isActive ? `${config.colors} scale-105 shadow-lg` : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                                }`}
                                            >
                                                {config.displayName}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-center text-sm font-semibold text-white">{DESTINY_COMPASS_CONFIG[aiSettings.destinyCompassMode].description}</p>
                             </div>
                        </ControlSection>

                        <ControlSection title="Dòng Chảy Vận Mệnh">
                            <p className="text-xs text-[#a08cb6] -mt-2 mb-2">Tần suất thế giới tự vận động (NPC ngoài màn hình tự hành động).</p>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-black/20 p-1 rounded-lg">
                                {([null, 1, 2, 3, 4, 5] as (number | null)[]).map((interval) => {
                                    const label = interval === null ? 'Tắt' : `${interval} lượt`;
                                    const isActive = aiSettings.flowOfDestinyInterval === interval;
                                    return (
                                        <button
                                            key={interval ?? 'off'}
                                            onClick={() => onSettingsChange({ flowOfDestinyInterval: interval })}
                                            disabled={isLoading}
                                            title={`Thế giới sẽ tự vận động sau mỗi ${label}.`}
                                            className={`px-2 py-1.5 text-xs font-bold rounded-md transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isActive ? 'bg-purple-600/80 border-purple-400 text-white scale-105 shadow-lg' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-center text-sm font-semibold text-white">
                                {aiSettings.flowOfDestinyInterval === null 
                                    ? "Thế giới sẽ đứng yên chờ bạn." 
                                    : `Các sự kiện ngoài màn hình sẽ diễn ra sau mỗi ${aiSettings.flowOfDestinyInterval} lượt.`
                                }
                            </p>
                        </ControlSection>

                        <ControlSection title="Logic & Diễn Giải">
                             <ToggleSwitch
                                id="logic-toggle"
                                label="Logic Nghiêm ngặt"
                                description="BẬT: AI tuân thủ quy tắc thế giới. TẮT: AI tuân theo mọi mệnh lệnh của bạn như một tác giả."
                                enabled={aiSettings.isLogicModeOn}
                                setEnabled={(val) => onSettingsChange({ isLogicModeOn: val })}
                            />
                            <div>
                                <ToggleSwitch
                                    id="turn-based-combat-toggle"
                                    label="Chiến đấu Turn-based"
                                    description="BẬT: Giao diện chiến đấu RPG. TẮT: Chiến đấu dạng văn bản do AI tường thuật."
                                    enabled={aiSettings.isTurnBasedCombat}
                                    setEnabled={(val) => onSettingsChange({ isTurnBasedCombat: val })}
                                />
                            </div>
                            <ToggleSwitch
                                id="strict-interpretation-toggle"
                                label="Diễn Giải Nghiêm Túc"
                                description="BẬT: AI diễn giải hành động theo hướng trong sáng. Tự động TẮT khi kích hoạt Dục Vọng."
                                enabled={aiSettings.isStrictInterpretationOn}
                                setEnabled={(val) => onSettingsChange({ isStrictInterpretationOn: val })}
                            />
                        </ControlSection>

                        <ControlSection title="Hành Vi Tình Cảm & Xung Đột">
                            <div>
                                <label className="block text-sm font-medium text-[#e8dff5]">Chế độ Dục Vọng</label>
                                <p className="text-xs text-[#a08cb6]">Kích hoạt để AI mô tả các cảnh 18+ một cách trần trụi theo phong cách đã chọn.</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                     {LUST_FLAVOR_CONFIG_WITH_OFF.map(({ flavor, label, Icon }) => {
                                        const isActive = aiSettings.lustModeFlavor === flavor;
                                        let activeClasses = 'bg-red-500/90 border-red-400 text-white scale-105';
                                        if (isActive && flavor === null) {
                                            activeClasses = 'bg-cyan-600/90 border-cyan-400 text-white scale-105';
                                        }

                                        return (
                                            <button
                                                key={flavor || 'off'}
                                                onClick={() => onSettingsChange({ lustModeFlavor: flavor })}
                                                disabled={isLoading}
                                                className={`flex items-center justify-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 text-xs font-semibold border-2 disabled:opacity-50 ${isActive ? activeClasses : 'bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-red-500/20 hover:border-red-500/50'}`}
                                            >
                                                <Icon /> <span>{label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {aiSettings.lustModeFlavor && (
                                    <p className="text-xs text-purple-300 text-center italic mt-2 animate-fade-in-fast">
                                        {LUST_MODE_DESCRIPTIONS[aiSettings.lustModeFlavor]}
                                    </p>
                                )}
                            </div>
                             <ToggleSwitch
                                id="conscience-toggle"
                                label="Chế độ Lương Tâm"
                                description="BẬT: AI sẽ ưu tiên các hành động cứu vãn, giúp NPC phục hồi lý trí và giảm căng thẳng."
                                enabled={aiSettings.isConscienceModeOn}
                                setEnabled={(val) => onSettingsChange({ isConscienceModeOn: val })}
                            />
                             <div>
                                <label className="block text-sm font-medium text-[#e8dff5]">Tâm Trí NPC</label>
                                <p className="text-xs text-[#a08cb6]">Quyết định cách NPC phản ứng trong các tình huống nhạy cảm, dựa trên tính cách của họ.</p>
                                <button
                                    onClick={handleMindsetChange}
                                    disabled={isLoading}
                                    className={`w-full flex items-center justify-center gap-2 mt-2 px-3 py-1.5 rounded-md transition-all duration-300 text-sm font-semibold border-2 disabled:opacity-50 bg-gray-800 border-gray-600 text-white`}
                                >
                                    <currentMindsetConfig.Icon />
                                    <span>{currentMindsetConfig.displayName}</span>
                                </button>
                                <p className="text-center text-xs text-gray-400 italic mt-1">{currentMindsetConfig.description}</p>
                            </div>
                        </ControlSection>

                    </div>
                )}
                {activeTab === 'advanced' && (
                     <div className="space-y-4">
                        <p className="text-sm text-center text-[#a08cb6]">Công cụ mạnh mẽ để dọn dẹp và tối ưu hóa trạng thái của các thực thể trong game. Sử dụng cẩn thận!</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="entity-action" className="block text-sm font-medium text-[#e8dff5] mb-1">Hành động</label>
                                <select id="entity-action" value={action} onChange={e => setAction(e.target.value as StatAction)} className="w-full px-4 py-2 bg-[#120c18] border-2 border-[#3a2d47] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e02585] focus:border-[#e02585]">
                                    <option value="DELETE">Xóa</option>
                                    <option value="REFINE">Tinh gọn (AI)</option>
                                    <option value="RECONSTRUCT">Tái cấu trúc (AI)</option>
                                    <option value="SANITIZE">Làm Sạch Dữ Liệu (AI)</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="entity-target" className="block text-sm font-medium text-[#e8dff5] mb-1">Mục tiêu</label>
                                <select id="entity-target" value={target} onChange={e => setTarget(e.target.value as EntityTarget)} className="w-full px-4 py-2 bg-[#120c18] border-2 border-[#3a2d47] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e02585] focus:border-[#e02585]" disabled={action === 'SANITIZE'}>
                                    <option value="PLAYER">Nhân vật chính</option>
                                    <option value="ALL_NPCS">Tất cả NPC</option>
                                    <option value="PLAYER_AND_ALL_NPCS">Tất cả (PC &amp; NPC)</option>
                                    <optgroup label="NPC Cụ thể">
                                        {npcs.map(npc => <option key={npc.id} value={npc.id}>{npc.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-[#e8dff5] mb-2">Phạm vi (Loại thuộc tính)</label>
                           <div className="grid grid-cols-2 gap-2">
                                {scopeOptions.map((opt) => (
                                    <label key={opt.key} className={`flex items-center justify-center px-2 py-1.5 rounded-md cursor-pointer border-2 transition-all ${scopes[opt.key] && action !== 'RECONSTRUCT' && action !== 'SANITIZE' ? 'bg-[#e02585]/30 border-[#e02585]' : 'bg-gray-700/50 border-transparent'} ${action === 'RECONSTRUCT' || action === 'SANITIZE' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <input type="checkbox" checked={!!scopes[opt.key]} onChange={() => handleScopeChange(opt.key)} disabled={action === 'RECONSTRUCT' || action === 'SANITIZE'} className="h-4 w-4 rounded text-[#e02585] bg-gray-800 border-gray-600 focus:ring-[#e02585] disabled:cursor-not-allowed" />
                                        <span className="ml-2 text-xs font-semibold text-white">{opt.label}</span>
                                    </label>
                                ))}
                           </div>
                        </div>
                        {action === 'RECONSTRUCT' && (
                            <div className="space-y-4 animate-fade-in-fast">
                                <TextareaField
                                    id="reconstruction-directive"
                                    label="Chỉ thị Tái cấu trúc (Tùy chọn)"
                                    placeholder="VD: 'Tôi muốn nhân vật trở nên tàn nhẫn và tham vọng hơn sau sự kiện X.' Nếu để trống, AI sẽ tự động 'sửa chữa' nhân vật dựa trên lịch sử."
                                    value={reconstructionDirective}
                                    onChange={(e) => setReconstructionDirective(e.target.value)}
                                    rows={3}
                                />
                                {isTargetingSpecificNpc && (
                                     <InputField
                                        id="new-personality"
                                        label="Tính cách mới (Tùy chọn)"
                                        placeholder="VD: Lạnh lùng, tàn nhẫn, phục tùng..."
                                        value={newPersonality}
                                        onChange={(e) => setNewPersonality(e.target.value)}
                                    />
                                )}
                            </div>
                        )}
                        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-yellow-500/30">
                            <p className="text-xs text-yellow-200" dangerouslySetInnerHTML={{ __html: infoMessage }} />
                        </div>
                        <div className="pt-2">
                             <Button onClick={handleExecute} variant="primary" disabled={isLoading || (action !== 'RECONSTRUCT' && action !== 'SANITIZE' && scopeOptions.every(opt => !scopes[opt.key]))}>
                                {isLoading ? 'Đang xử lý...' : 'Thực Hiện'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div className="pt-4 border-t border-[#e02585]/30">
                <Button onClick={onClose} variant="secondary" className="w-full">
                    Đóng
                </Button>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #633aab; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #e02585; }
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </Modal>
    );
};

export default AiControlModal;