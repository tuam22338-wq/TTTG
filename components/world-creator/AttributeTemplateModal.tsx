import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AttributeTemplate, allAttributeTemplates } from '../../services/attributeTemplates';

interface AttributeTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: AttributeTemplate) => void;
}

const AttributeTemplateModal: React.FC<AttributeTemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tải Mẫu Thuộc Tính">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        <p className="text-sm text-gray-400">Chọn một mẫu có sẵn để tải vào hệ thống. Hành động này sẽ ghi đè lên các thuộc tính tùy chỉnh hiện tại của bạn.</p>
        {allAttributeTemplates.map((template) => (
          <div key={template.id} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-pink-500/50 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h3 className="font-bold text-white text-lg">{template.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{template.description}</p>
              </div>
              <Button onClick={() => onSelectTemplate(template)} variant="secondary" className="!w-auto !py-1.5 !px-4 !text-sm ml-4">
                Chọn
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-6">
        <Button onClick={onClose} variant="secondary">Đóng</Button>
      </div>
      <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
      `}</style>
    </Modal>
  );
};

export default AttributeTemplateModal;