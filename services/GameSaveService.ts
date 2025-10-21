import { GameState, NovelSession } from '../types';
import * as StorageService from './StorageService';

// --- Manual Save ---

export async function saveManualSave(gameState: GameState): Promise<void> {
  await StorageService.saveGameState('manual', gameState);
}

export async function loadManualSave(): Promise<GameState | null> {
  return await StorageService.loadGameState('manual');
}

export async function hasManualSave(): Promise<boolean> {
  return await StorageService.hasSave('manual');
}

// --- Auto Save ---

export async function saveAutoSave(gameState: GameState): Promise<void> {
  await StorageService.saveGameState('auto', gameState);
}

export async function loadAutoSave(): Promise<GameState | null> {
  return await StorageService.loadGameState('auto');
}

export async function hasAutoSave(): Promise<boolean> {
  return await StorageService.hasSave('auto');
}

// --- General ---

export async function deleteAllLocalSaves(): Promise<void> {
  await StorageService.deleteSave('manual');
  await StorageService.deleteSave('auto');
}

// --- Novel Writer ---
export async function getAllNovelSessions(): Promise<NovelSession[]> {
  return await StorageService.getAllNovelSessions();
}

export async function loadNovelSession(id: string): Promise<NovelSession | null> {
  return await StorageService.loadNovelSession(id);
}

export async function saveNovelSession(session: NovelSession): Promise<void> {
  return await StorageService.saveNovelSession(session);
}

export async function deleteNovelSession(id: string): Promise<void> {
  return await StorageService.deleteNovelSession(id);
}


// --- File System (remains synchronous) ---

export function saveToFile(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState, null, 2); // Pretty print JSON
    const blob = new Blob([serializedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `BMS-TG-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to save game to file:", error);
    alert("Không thể tải file lưu.");
  }
}

export function loadFromFile(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      return reject(new Error("Vui lòng chọn một file save (.json) hợp lệ."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedState = JSON.parse(text);
        const validatedState = StorageService.validateAndHydrateGameState(parsedState); // Reuse validation logic
        if (validatedState) {
          resolve(validatedState);
        } else {
          reject(new Error("File save không hợp lệ hoặc bị hỏng."));
        }
      } catch (e) {
        reject(new Error("Không thể đọc file save. File có thể bị hỏng."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Đã xảy ra lỗi khi đọc file."));
    };
    reader.readAsText(file);
  });
}