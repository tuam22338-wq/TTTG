import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { NovelSession } from '../../types';
import * as GameSaveService from '../../services/GameSaveService';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { ContinueIcon } from '../icons/ContinueIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface NovelLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  onContinue: (sessionId: string) => void;
}

const NovelLibraryModal: React.FC<NovelLibraryModalProps> = ({ isOpen, onClose, onStartNew, onContinue }) => {
  const [sessions, setSessions] = useState<NovelSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
        const loadedSessions = await GameSaveService.getAllNovelSessions();
        setSessions(loadedSessions);
    } catch (error) {
        console.error("Failed to load novel sessions:", error);
        alert("Không thể tải danh sách truyện.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);
  
  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation();
      if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn câu chuyện này không?")) {
          await GameSaveService.deleteNovelSession(sessionId);
          fetchSessions(); // Refresh the list
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thư Viện Tiểu Thuyết">
      <div className="p-4 max-h-[70vh] flex flex-col">
        <button 
          onClick={onStartNew}
          className="flex items-center gap-4 w-full p-4 rounded-lg bg-pink-500/10 border-2 border-dashed border-pink-500/50 hover:bg-pink-500/20 hover:border-pink-500/80 text-white transition-all mb-4"
        >
          <PlusCircleIcon className="h-8 w-8 text-pink-400 flex-shrink-0" />
          <div className="text-left">
            <h3 className="font-bold text-lg">Bắt đầu câu chuyện mới</h3>
            <p className="text-sm text-neutral-300">Viết nên một tác phẩm từ trang giấy trắng.</p>
          </div>
        </button>

        <h3 className="text-sm font-bold uppercase text-neutral-400 tracking-wider mb-2 px-1">Các câu chuyện đã lưu</h3>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
            {isLoading ? (
                <p className="text-center text-neutral-400">Đang tải...</p>
            ) : sessions.length === 0 ? (
                <p className="text-center text-neutral-500 py-8">Chưa có câu chuyện nào được lưu.</p>
            ) : (
                <div className="space-y-2">
                    {sessions.map(session => (
                        <div 
                          key={session.id}
                          className="group p-3 bg-black/30 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-white truncate">{session.title || '(Chưa có tiêu đề)'}</p>
                                    <p className="text-xs text-neutral-400">
                                        Cập nhật lần cuối: {new Date(session.lastModified).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div className="flex items-center flex-shrink-0 ml-2">
                                    <button onClick={(e) => handleDelete(e, session.id)} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Xóa">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => onContinue(session.id)} className="p-2 text-neutral-300 hover:text-white hover:bg-white/20 rounded-full transition-colors" title="Tiếp tục">
                                        <ChevronRightIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
       <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: #555;
                border-radius: 10px;
            }
       `}</style>
    </Modal>
  );
};

export default NovelLibraryModal;