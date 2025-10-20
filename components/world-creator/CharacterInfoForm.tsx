import React, { useState } from 'react';
import { WorldCreationState, CharacterSkillInput, Settings } from '../../types';
import FormSection from './FormSection';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import { SparklesIcon } from '../icons/SparklesIcon';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import Button from '../ui/Button';
import * as client from '../../services/gemini/client';
import ChevronIcon from '../icons/ChevronIcon';
import { ApiClient } from '../../services/gemini/client';

interface CharacterInfoFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
    apiClient: ApiClient;
    settings: Settings;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const CharacterInfoForm: React.FC<CharacterInfoFormProps> = ({ state, setState, apiClient, settings }) => {
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
    const { getApiClient } = apiClient;
    
    const handleCharacterChange = (field: keyof WorldCreationState['character'], value: any) => {
        setState(s => ({ ...s, character: { ...s.character, [field]: value } }));
    };

    const handleGenerateBiography = async () => {
         if (!getApiClient()) {
            alert("Dịch vụ AI chưa sẵn sàng.");
            apiClient.onApiKeyInvalid();
            return;
        }
        if (!state.description) {
            alert("Vui lòng tạo mô tả bối cảnh thế giới trước khi tạo tiểu sử.");
            return;
        }
        setIsLoading(prev => ({ ...prev, bio: true }));

        const charGender = state.character.gender === 'Tự định nghĩa' ? state.character.customGender : state.character.gender;
        const userProvidedBiography = state.character.biography.trim();
        let basePrompt: string;

        if (userProvidedBiography) {
            // "Tiểu Sử Hợp Nhất" - User provided input, AI creates backstory leading to it.
            basePrompt = `Bạn là một AI biên kịch bậc thầy. Nhiệm vụ của bạn là kết hợp hài hòa giữa việc sáng tạo tiểu sử và việc tôn trọng bối cảnh khởi đầu của người dùng.

**YÊU CẦU NGHIÊM NGẶT:**
1.  **"Kịch bản khởi đầu" là bất biến:** Xem đoạn văn do người dùng cung cấp là khoảnh khắc HIỆN TẠI và là điểm bắt đầu của game.
2.  **Sáng tạo có định hướng:** Dựa vào thông tin nhân vật và thế giới, hãy tự do viết một tiểu sử chi tiết về quá khứ, nguồn gốc, động lực của nhân vật để giải thích tại sao họ lại có mặt tại "Kịch bản khởi đầu" này.
3.  **Kết thúc tại Hiện tại:** Đoạn tiểu sử bạn viết BẮT BUỘC phải kết thúc bằng việc mô tả lại "Kịch bản khởi đầu" của người dùng một cách liền mạch.
4.  **TUYỆT ĐỐI CẤM:** Không được viết bất kỳ sự kiện nào xảy ra SAU "Kịch bản khởi đầu". Dòng thời gian phải dừng lại ngay tại điểm người dùng đã chọn.

**Dữ liệu tham khảo (để đảm bảo nhất quán):**
- Bối cảnh thế giới: ${state.description || 'Chưa có.'}
- Thông tin nhân vật: Tên: ${state.character.name || 'Chưa có'}, Giới tính: ${charGender}, Tính cách: ${state.character.personality || 'Chưa có'}.

**Kịch bản khởi đầu từ người dùng (điểm kết của tiểu sử):**
---
${userProvidedBiography}
---

Hãy bắt đầu viết tiểu sử dẫn đến kịch bản trên.`;
        } else {
            // "Biên Kịch Sáng Tạo" - User did not provide input, AI acts as a Creative Writer.
            basePrompt = `Dựa trên các đặc điểm của nhân vật và bối cảnh thế giới đã được tạo ra, hãy viết một tiểu sử chi tiết và có chiều sâu. Tiểu sử này cần thể hiện:
- Quá khứ: Nhân vật sinh ra và lớn lên ở đâu trong thế giới này? Cuộc sống thời thơ ấu của họ bị ảnh hưởng bởi bối cảnh thế giới như thế nào?
- Động lực: Điều gì đã thúc đẩy nhân vật phát triển kỹ năng hay tính cách hiện tại? Mục tiêu hay khát vọng lớn nhất của họ là gì?
- Mối quan hệ: Nhân vật có mối liên hệ nào với các thế lực hoặc sự kiện quan trọng trong thế giới?

Hãy lồng ghép một cách tự nhiên các yếu tố của thế giới vào câu chuyện của nhân vật, ví dụ: nhân vật phải luyện tập ma thuật vì một cuộc chiến tranh đang đến, hoặc lớn lên trong một xã hội phân biệt chủng tộc. Tiểu sử này sẽ là tiền đề để bắt đầu game.

**BỐI CẢNH THẾ GIỚI:**
${state.description || 'Thế giới chưa được mô tả chi tiết.'}

**THÔNG TIN NHÂN VẬT:**
- Tên: ${state.character.name || 'Chưa có tên'}
- Giới tính: ${charGender}
- Tính cách: ${state.character.personality || 'Chưa xác định'}`;
        }
        
        let prompt = basePrompt;
        if (state.isNsfw) {
            prompt += "\n\nQuan trọng: Vì đây là thế giới 18+, hãy lồng ghép các trải nghiệm (kể cả tình dục) trong quá khứ như những sự kiện quan trọng định hình nên con người, động lực và mối quan hệ của nhân vật.";
        }
        
        try {
            const safetySettingsConfig = state.isNsfw ? [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ] : [];

            const response = await client.callCreativeTextAI(prompt, apiClient, settings.aiModelSettings, safetySettingsConfig);
            
            const text = response.text;
            handleCharacterChange('biography', text);
        } catch (error) {
            console.error("Error generating character biography:", error);
            alert("Đã xảy ra lỗi khi tạo tiểu sử. Vui lòng thử lại.");
        } finally {
            setIsLoading(prev => ({ ...prev, bio: false }));
        }
    }

    const handleAddSkill = () => {
        const newSkill: CharacterSkillInput = {
            id: Date.now().toString(),
            name: '',
            description: '',
            effect: '',
        };
        handleCharacterChange('skills', [...state.character.skills, newSkill]);
        setExpandedSkills(prev => new Set(prev).add(newSkill.id));
    };

    const handleRemoveSkill = (id: string) => {
        handleCharacterChange('skills', state.character.skills.filter(s => s.id !== id));
        setExpandedSkills(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    const handleSkillChange = (id: string, field: keyof Omit<CharacterSkillInput, 'id'>, value: string) => {
        const newSkills = state.character.skills.map(s => 
            s.id === id ? { ...s, [field]: value } : s
        );
        handleCharacterChange('skills', newSkills);
    };

    const toggleExpandSkill = (id: string) => {
        setExpandedSkills(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleGenerateSkillComponent = async (id: string, type: 'description' | 'effect') => {
        if (!getApiClient()) {
            alert("Dịch vụ AI chưa sẵn sàng.");
            apiClient.onApiKeyInvalid();
            return;
        }
        const skill = state.character.skills.find(s => s.id === id);
        if (!skill || !skill.name) {
            alert("Vui lòng nhập Tên Kỹ năng trước.");
            return;
        }

        const loadingKey = `${type}-${id}`;
        setIsLoading(prev => ({ ...prev, [loadingKey]: true }));

        let prompt = '';
        if (type === 'description') {
            prompt = `Bạn là một AI sáng tạo. Dựa vào tên kỹ năng "${skill.name}" và bối cảnh thế giới sau đây, hãy viết một mô tả ngắn gọn (khoảng 2-3 câu) về bản chất và nguồn gốc của kỹ năng này.\n\nBỐI CẢNH:\n${state.description || "Không có."}`;
        } else {
            if (!skill.description) {
                alert("Vui lòng nhập hoặc tạo Mô tả Kỹ năng trước khi tạo Hiệu quả.");
                setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
                return;
            }
            prompt = `Bạn là một AI thiết kế game. Dựa vào tên kỹ năng "${skill.name}" và mô tả "${skill.description}", hãy viết một mô tả về hiệu quả cụ thể của kỹ năng này, tập trung vào cơ chế game (ví dụ: gây sát thương, tạo hiệu ứng, buff/debuff...).`;
        }
        
        try {
            const result = await client.callCreativeTextAI(
                prompt, 
                apiClient, 
                settings.aiModelSettings,
                state.isNsfw ? [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ] : undefined
            );
            handleSkillChange(id, type, result.text);
        } catch (error) {
            console.error(`Error generating skill ${type}:`, error);
            alert(`Đã xảy ra lỗi khi tạo ${type === 'description' ? 'mô tả' : 'hiệu quả'}. Vui lòng thử lại.`);
        } finally {
            setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };


    return (
        <FormSection title="Thông Tin Nhân Vật" description="Kiến tạo linh hồn sẽ khuấy đảo vị diện này.">
            <InputField
                label="Tên Nhân Vật"
                id="char-name"
                placeholder="Tên gọi của bạn"
                value={state.character.name}
                onChange={e => handleCharacterChange('name', e.target.value)}
            />
            
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Giới tính</label>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {['Nam', 'Nữ', 'Tự định nghĩa'].map(g => (
                        <label key={g} className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value={g}
                                checked={state.character.gender === g}
                                onChange={() => handleCharacterChange('gender', g)}
                                className="h-4 w-4 text-pink-500 bg-neutral-800 border-neutral-700 focus:ring-pink-500 focus:ring-offset-neutral-900"
                            />
                            <span className="ml-2 text-sm text-white">{g}</span>
                        </label>
                    ))}
                </div>
                 {state.character.gender === 'Tự định nghĩa' && (
                    <div className="mt-3">
                        <InputField
                            id="custom-gender"
                            placeholder="Nhập giới tính của bạn"
                            value={state.character.customGender}
                            onChange={e => handleCharacterChange('customGender', e.target.value)}
                        />
                    </div>
                )}
            </div>

            <InputField
                label="Tính cách"
                id="char-personality"
                placeholder="Lạnh lùng, tà ác, dâm đãng, chính nghĩa..."
                value={state.character.personality}
                onChange={e => handleCharacterChange('personality', e.target.value)}
            />

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="char-bio" className="block text-sm font-medium text-neutral-400">Tiểu sử</label>
                    <button
                        onClick={handleGenerateBiography}
                        disabled={isLoading['bio']}
                        className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full bg-black/20 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="AI Hỗ trợ Tiểu sử"
                    >
                        <SparklesIcon isLoading={isLoading['bio']} />
                    </button>
                </div>
                <TextareaField
                    id="char-bio"
                    placeholder="Nguồn gốc, quá khứ, mục tiêu của nhân vật... hoặc để AI hỗ trợ."
                    value={state.character.biography}
                    onChange={e => handleCharacterChange('biography', e.target.value)}
                    rows={5}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Kỹ năng / Quyền năng khởi đầu</label>
                <div className="space-y-3">
                    {state.character.skills.map((skill) => {
                        const isExpanded = expandedSkills.has(skill.id);
                        return (
                            <div key={skill.id} className="bg-black/20 rounded-lg border border-white/10 overflow-hidden transition-all">
                                <div className="flex items-center p-3">
                                    <div className="flex-grow min-w-0">
                                        <InputField
                                            id={`skill-name-${skill.id}`}
                                            placeholder="Tên kỹ năng"
                                            value={skill.name}
                                            onChange={e => handleSkillChange(skill.id, 'name', e.target.value)}
                                            className="!py-1 !px-2 text-base font-semibold"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <button onClick={() => handleRemoveSkill(skill.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon /></button>
                                        <button onClick={() => toggleExpandSkill(skill.id)} className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"><ChevronIcon isExpanded={isExpanded} /></button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="px-3 pb-3 border-t border-white/10 space-y-4 animate-fade-in-fast">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label htmlFor={`skill-desc-${skill.id}`} className="block text-sm font-medium text-neutral-400">Mô tả kỹ năng</label>
                                                <button
                                                    onClick={() => handleGenerateSkillComponent(skill.id, 'description')}
                                                    disabled={isLoading[`description-${skill.id}`]}
                                                    className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full bg-black/20 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="AI Hỗ trợ Mô tả"
                                                >
                                                    <SparklesIcon isLoading={isLoading[`description-${skill.id}`]} />
                                                </button>
                                            </div>
                                            <TextareaField
                                                id={`skill-desc-${skill.id}`}
                                                placeholder="Mô tả ngắn gọn về bản chất kỹ năng. Có thể để AI hỗ trợ."
                                                value={skill.description}
                                                onChange={e => handleSkillChange(skill.id, 'description', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                         <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label htmlFor={`skill-effect-${skill.id}`} className="block text-sm font-medium text-neutral-400">Hiệu quả kỹ năng</label>
                                                <button
                                                    onClick={() => handleGenerateSkillComponent(skill.id, 'effect')}
                                                    disabled={isLoading[`effect-${skill.id}`]}
                                                    className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full bg-black/20 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="AI Hỗ trợ Hiệu quả"
                                                >
                                                    <SparklesIcon isLoading={isLoading[`effect-${skill.id}`]} />
                                                </button>
                                            </div>
                                            <TextareaField
                                                id={`skill-effect-${skill.id}`}
                                                placeholder="Mô tả hiệu quả cụ thể, cơ chế game. Có thể để AI hỗ trợ."
                                                value={skill.effect}
                                                onChange={e => handleSkillChange(skill.id, 'effect', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    <button onClick={handleAddSkill} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-2 text-sm border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-white/5 hover:text-white hover:border-white/10 hover:border-solid font-semibold">+ Thêm Kỹ Năng</button>
                </div>
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
        </FormSection>
    )
}

export default CharacterInfoForm;