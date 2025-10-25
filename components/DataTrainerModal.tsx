import React, { useState, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { TrainingDataSet, TrainingDataChunk } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import InputField from './ui/InputField';
import * as StorageService from '../services/StorageService';
import * as client from '../services/gemini/client';

interface DataTrainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    settingsHook: ReturnType<typeof useSettings>;
}

const RangeSlider: React.FC<{
    label: string;
    id: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit?: string;
}> = ({ label, id, min, max, step, value, onChange, unit }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
        <div className="flex items-center gap-4">
            <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer" />
            <span className="text-sm font-mono text-white w-20 text-center">{value}{unit || ''}</span>
        </div>
    </div>
);

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return [];
    
    const chunks: string[] = [];
    let i = 0;
    while (i < words.length) {
        const end = i + chunkSize;
        const chunk = words.slice(i, end).join(' ');
        chunks.push(chunk);
        
        const step = chunkSize - overlap;
        i += step > 0 ? step : 1; // Ensure progress
    }
    return chunks;
}


const DataTrainerModal: React.FC<DataTrainerModalProps> = ({ isOpen, onClose, settingsHook }) => {
    const [trainingName, setTrainingName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [chunkSize, setChunkSize] = useState(200);
    const [overlap, setOverlap] = useState(50);
    
    const [status, setStatus] = useState<'idle' | 'training' | 'error'>('idle');
    const [progressMessage, setProgressMessage] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { settings, getApiClient, cycleToNextApiKey, apiStats, onApiKeyInvalid } = settingsHook;

    const apiClient = { getApiClient, cycleToNextApiKey, apiStats, onApiKeyInvalid };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/plain') {
            setFile(selectedFile);
            if (!trainingName) {
                setTrainingName(selectedFile.name.replace('.txt', ''));
            }
        } else {
            alert('Vui lòng chọn một tệp .txt hợp lệ.');
            setFile(null);
        }
    };

    const handleStartTraining = async () => {
        if (!file || !trainingName.trim() || !getApiClient()) {
            alert('Vui lòng điền tên, chọn tệp và đảm bảo API key đã được cấu hình.');
            return;
        }

        setStatus('training');
        setProgressMessage('Đang đọc tệp...');

        try {
            const fileContent = await file.text();
            setProgressMessage('Đang chia nhỏ văn bản...');
            const chunks = chunkText(fileContent, chunkSize, overlap);
            
            if (chunks.length === 0) {
                throw new Error("Không có nội dung nào trong tệp để huấn luyện.");
            }

            setProgressMessage(`Chuẩn bị vector hóa ${chunks.length} chunks...`);
            
            const BATCH_SIZE = 100; // Gemini API limit for batchEmbedContents
            const allEmbeddings: number[][] = [];
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + BATCH_SIZE);
                setProgressMessage(`Đang vector hóa chunks ${i + 1}-${Math.min(i + BATCH_SIZE, chunks.length)} / ${chunks.length}...`);
                const batchEmbeddings = await client.callBatchEmbeddingModel(batchChunks, apiClient);
                allEmbeddings.push(...batchEmbeddings);
            }
            
            if (allEmbeddings.length !== chunks.length) {
                throw new Error(`Số lượng embeddings trả về (${allEmbeddings.length}) không khớp với số lượng chunks (${chunks.length}).`);
            }

            const embeddedChunks: TrainingDataChunk[] = chunks.map((chunk, index) => ({
                content: chunk,
                embedding: allEmbeddings[index],
            }));

            const newDataSet: TrainingDataSet = {
                id: `knowledge_${Date.now()}`,
                name: trainingName.trim(),
                createdAt: Date.now(),
                chunkSettings: { size: chunkSize, overlap: overlap },
                chunks: embeddedChunks,
            };

            setProgressMessage('Đang lưu vào cơ sở dữ liệu...');
            await StorageService.saveTrainingSet(newDataSet);

            setProgressMessage('Hoàn thành!');
            setTimeout(() => {
                resetAndClose();
            }, 1000);

        } catch (error: any) {
            console.error("Training failed:", error);
            setStatus('error');
            setProgressMessage(`Lỗi: ${error.message}`);
        }
    };
    
    const resetAndClose = () => {
        setTrainingName('');
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
        setChunkSize(200);
        setOverlap(50);
        setStatus('idle');
        setProgressMessage('');
        onClose();
    };

    const isTraining = status === 'training';

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="Huấn Luyện Dữ Liệu Thế Giới">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                <p className="text-sm text-neutral-400">Tải lên một tệp văn bản (.txt) chứa toàn bộ lore, bối cảnh, hoặc các quy tắc của thế giới bạn. AI sẽ "học" từ tệp này để đưa ra các phản hồi nhất quán hơn.</p>
                
                <InputField id="training-name" label="Tên Bộ Dữ Liệu" value={trainingName} onChange={e => setTrainingName(e.target.value)} placeholder="VD: Lore Tam Quốc, Bối cảnh Tiên hiệp ABC..." disabled={isTraining} />

                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Tệp Huấn Luyện (.txt)</label>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isTraining} className="!w-auto">Chọn Tệp</Button>
                        <span className="text-neutral-300 truncate">{file?.name || 'Chưa có tệp nào được chọn.'}</span>
                        <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                </div>

                <div className="p-4 bg-black/20 rounded-lg border border-neutral-700 space-y-4">
                     <h3 className="text-base font-bold text-white">Cài đặt Chunk</h3>
                     <RangeSlider label="Số từ mỗi chunk" id="chunk-size" min={50} max={500} step={10} value={chunkSize} onChange={e => setChunkSize(parseInt(e.target.value))} unit=" từ"/>
                     <RangeSlider label="Số từ overlap" id="overlap-size" min={0} max={250} step={5} value={overlap} onChange={e => setOverlap(parseInt(e.target.value))} unit=" từ"/>
                     <p className="text-xs text-neutral-400 -mt-2 px-1">Overlap giúp AI không bỏ lỡ ngữ cảnh ở ranh giới giữa các chunk.</p>
                </div>

                 {status !== 'idle' && (
                    <div className={`p-3 rounded-lg border ${status === 'error' ? 'bg-red-900/20 border-red-500/50' : 'bg-blue-900/20 border-blue-500/50'}`}>
                        <p className={`text-center font-semibold ${status === 'error' ? 'text-red-300' : 'text-blue-300'}`}>{progressMessage}</p>
                    </div>
                 )}
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-4 pt-6">
                <Button onClick={handleStartTraining} disabled={isTraining || !file || !trainingName.trim()}>
                    {isTraining ? 'Đang Huấn Luyện...' : 'Bắt đầu Huấn Luyện'}
                </Button>
                <Button onClick={resetAndClose} variant="secondary" disabled={isTraining}>Hủy</Button>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
            `}</style>
        </Modal>
    );
};

export default DataTrainerModal;