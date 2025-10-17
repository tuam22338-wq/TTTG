import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';

interface PowerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string, description: string }) => void;
  isLoading: boolean;
}

const PowerCreationModal: React.FC<PowerCreationModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() });
    }
  };

  const descriptionPlaceholder = `Mô tả chi tiết về nguồn gốc, sức mạnh, hình dạng... AI sẽ dùng thông tin này để tạo ra các chiêu thức và thuộc tính.

Ví dụ: Bộ kỹ năng của Master Yi trong liên minh huyền thoại, Bát Môn Độn Giáp trong Naruto, Trái Ác Quỷ Gura Gura no Mi trong One Piece`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sáng Tạo Bộ Kỹ Năng">
      <div className="space-y-6">
        <p className="text-gray-300">Mô tả ý tưởng của bạn. AI sẽ dựa vào đây để kiến tạo một bộ kỹ năng hoàn chỉnh cho bạn.</p>
        <InputField
          id="power-name"
          label="Tên Bộ Kỹ Năng"
          placeholder="VD: Ma Kiếm Đoạn Hồn, Vô Ảnh Cước..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <TextareaField
          id="power-description"
          label="Mô Tả & Ý Tưởng"
          placeholder={descriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          disabled={isLoading}
        />
        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-2">
           <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading ? 'Đang Kiến Tạo...' : 'Kiến Tạo'}
          </Button>
          <Button onClick={onClose} variant="secondary" disabled={isLoading}>
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PowerCreationModal;
