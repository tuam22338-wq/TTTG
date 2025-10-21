import React from 'react';
import Modal from './Modal';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { ContinueIcon } from '../icons/ContinueIcon';

interface NovelStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  onContinue: () => void;
}

const StartOptionCard: React.FC<{ title: string; description: string; Icon: React.FC<{className?: string}>; onSelect: () => void; }> = ({ title, description, Icon, onSelect }) => {
  return (
    <button onClick={onSelect} className="w-full flex flex-col items-center justify-center p-6 bg-black/30 rounded-lg border border-neutral-600 hover:border-pink-500/50 transition-colors duration-300 text-center">
        <Icon className="h-12 w-12 text-pink-400 mb-3" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-neutral-400 mt-1">{description}</p>
    </button>
  );
};

const NovelStartModal: React.FC<NovelStartModalProps> = ({ isOpen, onClose, onStartNew, onContinue }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Tiểu Thuyết Gia">
      <div className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StartOptionCard title="Bắt Đầu Mới" description="Xóa lịch sử cũ và bắt đầu một câu chuyện hoàn toàn mới." Icon={PlusCircleIcon} onSelect={onStartNew} />
          <StartOptionCard title="Tải Lịch Sử" description="Tiếp tục viết câu chuyện bạn đang dang dở." Icon={ContinueIcon} onSelect={onContinue} />
        </div>
      </div>
    </Modal>
  );
};

export default NovelStartModal;
