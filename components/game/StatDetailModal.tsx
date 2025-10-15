import React, { useState, useEffect } from 'react';
import { CharacterStat, StatType } from '../../types';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import ConfirmationModal from '../ui/ConfirmationModal';

interface StatDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stat: (CharacterStat & { name: string }) | null;
  ownerName: string;
  onSave?: (oldStatName: string, newStatData: CharacterStat & { name: string }, ownerType: 'player' | 'npc', ownerId?: string) => void;
  onDelete?: (statName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
  ownerType?: 'player' | 'npc';
  ownerId?: string;
}

const stripHighlightTags = (text: string | number | undefined): string => {
    const str = String(text ?? '');
    return str.replace(/\[HN\]/g, '').replace(/\[\/HN\]/g, '');
};


const getStatTheme = (type: StatType | undefined): { border: string; shadow: string; bg: string; text: string; headerBorder: string; } => {
  switch (type) {
    case StatType.GOOD: return { 
        bg: 'bg-green-900/20 backdrop-blur-md', 
        border: 'border-green-500', 
        shadow: 'shadow-[0_0_25px_rgba(74,222,128,0.5)]',
        text: 'text-green-300',
        headerBorder: 'border-green-500/30'
    };
    case StatType.BAD: return { 
        bg: 'bg-red-900/20 backdrop-blur-md', 
        border: 'border-red-500', 
        shadow: 'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
        text: 'text-red-300',
        headerBorder: 'border-red-500/30'
    };
    case StatType.INJURY: return { 
        bg: 'bg-orange-900/20 backdrop-blur-md', 
        border: 'border-orange-500', 
        shadow: 'shadow-[0_0_25px_rgba(249,115,22,0.5)]',
        text: 'text-orange-300',
        headerBorder: 'border-orange-500/30'
    };
    case StatType.NSFW: return { 
        bg: 'bg-pink-900/20 backdrop-blur-md', 
        border: 'border-pink-500', 
        shadow: 'shadow-[0_0_25px_rgba(236,72,153,0.5)]',
        text: 'text-pink-300',
        headerBorder: 'border-pink-500/30'
    };
     case StatType.KNOWLEDGE: return { 
        bg: 'bg-blue-900/20 backdrop-blur-md', 
        border: 'border-blue-500', 
        shadow: 'shadow-[0_0_25px_rgba(59,130,246,0.5)]',
        text: 'text-blue-300',
        headerBorder: 'border-blue-500/30'
    };
    case StatType.NEUTRAL:
    default:
        return { 
            bg: 'bg-gray-900/20 backdrop-blur-md', 
            border: 'border-gray-500', 
            shadow: 'shadow-[0_0_25px_rgba(156,163,175,0.4)]',
            text: 'text-gray-300',
            headerBorder: 'border-gray-500/30'
        };
  }
};

const DetailRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div>
            <p className="text-sm font-semibold text-[#a08cb6] mb-1">{label}</p>
            <p className="text-base text-white bg-black/20 p-3 rounded-md">{stripHighlightTags(value)}</p>
        </div>
    );
};

const StatDetailModal: React.FC<StatDetailModalProps> = ({ isOpen, onClose, stat, ownerName, onSave, onDelete, ownerType, ownerId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [effect, setEffect] = useState('');
  const [source, setSource] = useState('');
  const [cure, setCure] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (stat) {
      setName(stripHighlightTags(stat.name));
      setDescription(stripHighlightTags(stat.description));
      setEffect(stripHighlightTags(stat.effect));
      setSource(stripHighlightTags(stat.source));
      setCure(stripHighlightTags(stat.cure));
      setDuration(stat.duration !== undefined ? String(stat.duration) : '');
    }
  }, [stat, isEditing]);

  useEffect(() => {
    if (!isOpen) {
        setIsEditing(false);
    }
  }, [isOpen]);

  if (!isOpen || !stat) return null;
  
  const handleSaveClick = () => {
    if (!onSave || !ownerType || !name.trim()) return;
    
    const parsedDuration = parseInt(duration, 10);
    const newStatData: CharacterStat & { name: string } = {
        name: name.trim(),
        description: description.trim(),
        effect: effect.trim(),
        source: source.trim(),
        cure: cure.trim(),
        type: stat.type, // Type is not editable
        duration: duration.trim() === '' || isNaN(parsedDuration) ? undefined : parsedDuration,
    };

    onSave(stat.name, newStatData, ownerType, ownerId);
    setIsEditing(false);
  };

  const confirmDelete = () => {
    if (!onDelete || !ownerType) return;
    onDelete(stat.name, ownerType, ownerId);
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  const theme = getStatTheme(stat.type);
  const title = `Trạng thái của ${ownerName}`;
  const durationText = stat.duration ? `${stat.duration} phút` : 'Vĩnh viễn';
  const cleanStatName = stripHighlightTags(stat.name);

  return (
    <>
     <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl w-full max-w-md mx-auto border transform transition-all duration-300 ease-out scale-95 animate-scale-in flex flex-col max-h-[90vh] ${theme.bg} ${theme.border} ${theme.shadow}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex justify-between items-center p-6 border-b flex-shrink-0 ${theme.headerBorder}`}>
          <h2 className="text-2xl font-bold text-white font-rajdhani">{title}</h2>
          <button 
            onClick={onClose}
            className="text-[#a08cb6] hover:text-white transition-colors rounded-full p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow min-h-0">
            {isEditing ? (
                <div className="space-y-4">
                     <InputField id="stat-name" label="Tên Trạng thái" value={name} onChange={e => setName(e.target.value)} />
                     <TextareaField id="stat-desc" label="Mô tả" value={description} onChange={e => setDescription(e.target.value)} rows={3}/>
                     <TextareaField id="stat-effect" label="Ảnh hưởng" value={effect} onChange={e => setEffect(e.target.value)} rows={3}/>
                     <TextareaField id="stat-source" label="Nguồn gốc" value={source} onChange={e => setSource(e.target.value)} rows={2}/>
                     <TextareaField id="stat-cure" label="Cách chữa trị" value={cure} onChange={e => setCure(e.target.value)} rows={2}/>
                     <InputField id="stat-duration" label="Thời gian (phút, trống = vĩnh viễn)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg bg-black/20`}>
                        <h3 className={`text-2xl font-bold font-rajdhani ${theme.text}`}>{cleanStatName}</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <DetailRow label="Mô tả" value={stat.description} />
                        <DetailRow label="Ảnh hưởng" value={stat.effect} />
                        <DetailRow label="Nguồn gốc" value={stat.source} />
                        <DetailRow label="Cách chữa trị" value={stat.cure} />
                        <DetailRow label="Thời gian" value={durationText} />
                    </div>
                </div>
            )}
        </div>
        
        <div className={`p-4 border-t flex-shrink-0 ${theme.headerBorder} bg-black/10 rounded-b-2xl`}>
             <div className="flex gap-4">
                {isEditing ? (
                    <>
                        <Button onClick={handleSaveClick} variant="primary" className="flex-1">Lưu</Button>
                        <Button onClick={() => setIsEditing(false)} variant="secondary" className="flex-1">Hủy</Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setIsEditing(true)} variant="primary" className="flex-1">Chỉnh sửa</Button>
                        <Button onClick={() => setIsDeleteConfirmOpen(true)} variant="secondary" className="flex-1">Xóa</Button>
                    </>
                )}
             </div>
        </div>
      </div>
       <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #633aab; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #e02585; }
      `}</style>
    </div>
    <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmVariant="primary"
      >
        <p>Bạn có chắc chắn muốn xóa vĩnh viễn trạng thái <strong className="text-white">{stat.name}</strong> không?</p>
      </ConfirmationModal>
    </>
  );
};

export default StatDetailModal;