import React, { useState, useRef } from 'react';
import { WorldCreationState, CultivationSystemSettings } from '../../types';
import ToggleSwitch from '../ui/ToggleSwitch';
import Button from '../ui/Button';
import CultivationEditorModal from './CultivationEditorModal';
import * as PresetFileService from '../../services/PresetFileService';
import { DownloadIcon } from '../icons/DownloadIcon';
import { UploadIcon } from '../icons/UploadIcon';

interface CultivationSystemFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
}

const CultivationSystemForm: React.FC<CultivationSystemFormProps> = ({ state, setState }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        PresetFileService.saveDataToFile(state.cultivationSystem, 'BMS_TG_Cultivation_Preset.json');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const system = await PresetFileService.loadDataFromFile(
                    file, 
                    PresetFileService.isCultivationSystem,
                    "File không phải là một mẫu hệ thống cảnh giới hợp lệ."
                );
                setState(s => ({ ...s, cultivationSystem: system }));
            } catch (error: any) {
                alert(error.message);
            } finally {
                 if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };
    
    return (
        <div className="space-y-4">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <ToggleSwitch
                label="Kích hoạt Hệ thống Cảnh giới"
                id="cultivation-toggle"
                enabled={state.isCultivationEnabled}
                setEnabled={enabled => setState(s => ({ ...s, isCultivationEnabled: enabled }))}
                description="Khi kích hoạt, nhân vật và NPC sẽ có hệ thống cấp độ và cảnh giới."
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                    variant="secondary" 
                    onClick={() => setIsEditorOpen(true)}
                    disabled={!state.isCultivationEnabled}
                    className="sm:col-span-1"
                >
                    Mở Trình Chỉnh Sửa
                </Button>
                <Button onClick={handleExport} variant="secondary" disabled={!state.isCultivationEnabled} className="flex items-center justify-center gap-2">
                    <DownloadIcon className="h-5 w-5" /> Xuất Mẫu
                </Button>
                 <Button onClick={handleImportClick} variant="secondary" disabled={!state.isCultivationEnabled} className="flex items-center justify-center gap-2">
                    <UploadIcon className="h-5 w-5" /> Nhập Mẫu
                </Button>
            </div>

            <CultivationEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                state={state}
                setState={setState}
            />
        </div>
    );
};

export default CultivationSystemForm;
