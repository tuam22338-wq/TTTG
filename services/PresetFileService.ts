import { WorldCreationState, CultivationSystemSettings, CustomAttributeDefinition } from '../types';

/**
 * Saves arbitrary data to a JSON file and triggers a download.
 * @param data The data to save.
 * @param filename The desired filename for the download.
 */
export function saveDataToFile(data: any, filename: string): void {
  try {
    const serializedState = JSON.stringify(data, null, 2);
    const blob = new Blob([serializedState], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Failed to save data to file ${filename}:`, error);
    alert(`Không thể lưu file: ${filename}.`);
  }
}

/**
 * Loads data from a user-selected JSON file and validates it.
 * @param file The .json file selected by the user.
 * @param validator A type guard function to validate the parsed data.
 * @returns A promise that resolves with the parsed and validated data.
 */
export function loadDataFromFile<T>(file: File, validator: (data: any) => data is T, errorMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      return reject(new Error("Vui lòng chọn một file .json hợp lệ."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedData = JSON.parse(text);
        
        if (validator(parsedData)) {
          resolve(parsedData);
        } else {
          reject(new Error(errorMessage));
        }
      } catch (e) {
        reject(new Error("Không thể đọc file. File có thể bị hỏng."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Đã xảy ra lỗi khi đọc file."));
    };
    reader.readAsText(file);
  });
}

// --- Type Guards / Validators ---

export const isCultivationSystem = (data: any): data is CultivationSystemSettings => {
    return data && typeof data.systemName === 'string' && Array.isArray(data.mainTiers);
};

export const isAttributeSystem = (data: any): data is CustomAttributeDefinition[] => {
    return Array.isArray(data) && (data.length === 0 || (typeof data[0].id === 'string' && typeof data[0].name === 'string'));
};
