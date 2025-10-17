import React, { useState, useEffect } from 'react';
import { GameState } from '../../types';
import * as GameSaveService from '../../services/GameSaveService';
import Modal from './Modal';
import Button from './Button';

interface ContinueGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadManual: () => void;
  onLoadAuto: () => void;
}

const SaveSlotCard: React.FC<{ title: string; saveData: GameState | null; onLoad: () => void; }> = ({ title, saveData, onLoad }) => {
  if (!saveData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-lg border-2 border-dashed border-neutral-700 h-52 text-center">
        <p className="text-neutral-500 font-semibold">{title}</p>
        <p className="text-neutral-600 text-sm mt-1">Trống</p>
      </div>
    );
  }

  const lastEntry = saveData.chronicle && saveData.chronicle.length > 0 ? saveData.chronicle[saveData.chronicle.length - 1] : null;
  const lastPlayed = lastEntry?.isoTimestamp 
    ? new Date(lastEntry.isoTimestamp).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : 'Không rõ';

  return (
    <div className="flex flex-col p-4 bg-black/30 rounded-lg border border-neutral-600 hover:border-pink-500/50 transition-colors duration-300">
      <h3 className="text-lg font-bold text-pink-400 border-b border-neutral-700 pb-2 mb-3">{title}</h3>
      <div className="space-y-1 text-sm flex-grow">
        <p><span className="font-semibold text-neutral-400">Nhân vật:</span> <span className="text-white font-bold">{saveData.worldContext.character.name}</span></p>
        <p><span className="font-semibold text-neutral-400">Cấp độ:</span> <span className="text-white font-bold">{saveData.cultivation.level}</span></p>
        <p><span className="font-semibold text-neutral-400">Lần chơi cuối:</span> <span className="text-white font-bold">{lastPlayed}</span></p>
      </div>
      <Button onClick={onLoad} className="mt-4 !py-2 !text-base">Tải</Button>
    </div>
  );
};

const ContinueGameModal: React.FC<ContinueGameModalProps> = ({ isOpen, onClose, onLoadManual, onLoadAuto }) => {
  const [manualSaveData, setManualSaveData] = useState<GameState | null>(null);
  const [autoSaveData, setAutoSaveData] = useState<GameState | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load data only when modal opens to get fresh info
      setManualSaveData(GameSaveService.loadManualSave());
      setAutoSaveData(GameSaveService.loadAutoSave());
    }
  }, [isOpen]);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tiếp tục Trò chơi">
      <div className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SaveSlotCard title="Lưu thủ công" saveData={manualSaveData} onLoad={onLoadManual} />
          <SaveSlotCard title="Lưu tự động" saveData={autoSaveData} onLoad={onLoadAuto} />
        </div>
        {!manualSaveData && !autoSaveData && (
          <p className="text-center text-neutral-500 py-12">Không tìm thấy file lưu nào.</p>
        )}
      </div>
    </Modal>
  );
};

export default ContinueGameModal;
