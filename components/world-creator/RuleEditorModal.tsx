import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import { WorldRule } from '../../types';

interface RuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: WorldRule) => void;
  rule: WorldRule | null;
}

const RuleEditorModal: React.FC<RuleEditorModalProps> = ({ isOpen, onClose, onSave, rule }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen && rule) {
      setName(rule.name);
      setContent(rule.content);
    } else if (isOpen && !rule) {
      setName('');
      setContent('');
    }
  }, [isOpen, rule]);

  const handleSave = () => {
    if (!name.trim()) {
        alert("Vui lòng nhập tên cho quy luật.");
        return;
    }
    onSave({
        id: rule ? rule.id : `srule_${Date.now()}`,
        name,
        content,
        isEnabled: rule ? rule.isEnabled : true,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={rule ? 'Chỉnh Sửa Quy Luật' : 'Thêm Quy Luật Mới'}>
      <div className="space-y-4">
        <InputField
          id="rule-name"
          label="Tên Quy Luật"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Định luật Bảo toàn Năng lượng"
        />
        <TextareaField
          id="rule-content"
          label="Nội dung Quy Luật"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Mô tả chi tiết cách quy luật này hoạt động và ảnh hưởng đến thế giới..."
        />
        <div className="flex justify-end gap-4 pt-4">
          <Button onClick={onClose} variant="secondary">Hủy</Button>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RuleEditorModal;
