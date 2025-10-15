import React, { useState } from 'react';
import { WorldCreationState } from '../../types';
import FormSection from './FormSection';
import ToggleSwitch from '../ui/ToggleSwitch';
import Button from '../ui/Button';
import CultivationEditorModal from './CultivationEditorModal';

interface CultivationSystemFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
}

const CultivationSystemForm: React.FC<CultivationSystemFormProps> = ({ state, setState }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    
    return (
        <FormSection title="Hệ Thống Cảnh Giới" description="Kích hoạt và tùy chỉnh hệ thống tu luyện, cảnh giới cho thế giới của bạn.">
            <ToggleSwitch
                label="Kích hoạt Hệ thống Cảnh giới"
                id="cultivation-toggle"
                enabled={state.isCultivationEnabled}
                setEnabled={enabled => setState(s => ({ ...s, isCultivationEnabled: enabled }))}
                description="Khi kích hoạt, nhân vật và NPC sẽ có hệ thống cấp độ và cảnh giới."
            />
            <Button 
                variant="secondary" 
                onClick={() => setIsEditorOpen(true)}
                disabled={!state.isCultivationEnabled}
            >
                Mở Trình Chỉnh Sửa Cảnh Giới
            </Button>

            <CultivationEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                state={state}
                setState={setState}
            />
        </FormSection>
    );
};

export default CultivationSystemForm;