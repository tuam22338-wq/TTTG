import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TextareaField from '../ui/TextareaField';

interface QuickAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (idea: string) => void;
  isLoading: boolean;
  title?: string;
}

const QuickAssistModal: React.FC<QuickAssistModalProps> = ({ isOpen, onClose, onSubmit, isLoading, title = "AI Hỗ Trợ Nhanh" }) => {
  const [idea, setIdea] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIdea('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (idea.trim()) {
      onSubmit(idea.trim());
    }
  };

  const placeholder = "Nhập ý tưởng chính của bạn về thế giới (VD: một thế giới tiên hiệp nơi con người và yêu ma cùng tồn tại, một thành phố cyberpunk bị thống trị bởi các tập đoàn công nghệ, một vương quốc fantasy đen tối đang trên bờ vực sụp đổ...)";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-gray-300">Hãy đưa ra một ý tưởng cốt lõi. AI sẽ dựa vào đó để xây dựng một thế giới hoàn chỉnh cho bạn, bao gồm bối cảnh, nhân vật chính, các phe phái và NPC ban đầu.</p>
        <TextareaField
          id="quick-assist-idea"
          label="Ý Tưởng Thế Giới"
          placeholder={placeholder}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={5}
          disabled={isLoading}
        />
        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-2">
           <Button onClick={handleSubmit} disabled={isLoading || !idea.trim()}>
            {isLoading ? 'Đang Sáng Tạo...' : 'Tạo Nhanh'}
          </Button>
          <Button onClick={onClose} variant="secondary" disabled={isLoading}>
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuickAssistModal;