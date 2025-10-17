import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { AiModelSettings } from '../../types';
import { ApiStatsManager } from '../../hooks/useApiStats';

const MAX_RETRIES = 3;

export interface ApiClient {
    getApiClient: () => GoogleGenAI | null;
    cycleToNextApiKey: () => void;
    apiStats: ApiStatsManager;
}

async function callGeminiWithRetry(
    apiClient: ApiClient,
    callFunction: (geminiService: GoogleGenAI) => Promise<GenerateContentResponse>
): Promise<GenerateContentResponse> {
    for (let i = 0; i < MAX_RETRIES; i++) {
        const geminiService = apiClient.getApiClient();
        if (!geminiService) {
            throw new Error("Không thể khởi tạo Gemini Client. Vui lòng kiểm tra API key.");
        }

        try {
            return await callFunction(geminiService);
        } catch (error: any) {
            const isRateLimitError = error.message && (error.message.includes('429') || error.message.includes('rate limit'));
            if (isRateLimitError && i < MAX_RETRIES - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.warn(`Rate limit error (429) encountered. Retrying with next key in ${Math.round(delay / 1000)}s... (Attempt ${i + 1}/${MAX_RETRIES})`);
                apiClient.cycleToNextApiKey(); // Cycle to the next key before retrying
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Re-throw the error if it's not a rate limit error or if it's the last retry
                throw error;
            }
        }
    }
    // This line should theoretically be unreachable
    throw new Error("Đã đạt đến số lần thử lại tối đa.");
}


async function performApiCall<T extends GenerateContentResponse | AsyncGenerator<GenerateContentResponse>>(
    apiClient: ApiClient,
    callLogic: (geminiService: GoogleGenAI) => Promise<T>
): Promise<T> {
    apiClient.apiStats.recordRequestStart();
    const startTime = Date.now();
    let success = false;
    try {
        const response = await callLogic(apiClient.getApiClient()!);
        success = true;
        return response;
    } catch (e) {
        console.error("Lỗi gọi API:", e);
        throw e;
    } finally {
        apiClient.apiStats.recordRequestEnd(startTime, success);
    }
}


export async function callJsonAI(
    prompt: string, 
    schema: object, 
    apiClient: ApiClient, 
    modelSettings: AiModelSettings,
    safetySettings: any
): Promise<GenerateContentResponse> {
    const callLogic = (geminiService: GoogleGenAI) => {
        const config: any = {
            responseMimeType: "application/json",
            responseSchema: schema,
            safetySettings: safetySettings,
            temperature: modelSettings.temperature,
            topP: modelSettings.topP,
            topK: modelSettings.topK,
            maxOutputTokens: modelSettings.maxOutputTokens,
        };
        if (modelSettings.model === 'gemini-2.5-flash') {
            config.thinkingConfig = { thinkingBudget: modelSettings.thinkingBudget };
        }
        
        return geminiService.models.generateContent({
            model: modelSettings.model,
            contents: prompt,
            config,
        });
    };

    const response = await performApiCall(apiClient, () => callGeminiWithRetry(apiClient, callLogic));
    
    if (!response.text) {
         const errorDetails = response.candidates?.[0]?.finishReason || JSON.stringify(response);
         console.error("API Error: No text in response. Details:", errorDetails);
         throw new Error(`AI không trả về nội dung JSON. Lý do: ${errorDetails}`);
    }
    return response;
}

export async function callJsonAIStream(
    prompt: string, 
    schema: object, 
    apiClient: ApiClient, 
    modelSettings: AiModelSettings,
    safetySettings: any
): Promise<AsyncGenerator<GenerateContentResponse>> {
     const callLogic = (geminiService: GoogleGenAI) => {
        const config: any = {
            responseMimeType: "application/json",
            responseSchema: schema,
            safetySettings: safetySettings,
            temperature: modelSettings.temperature,
            topP: modelSettings.topP,
            topK: modelSettings.topK,
            maxOutputTokens: modelSettings.maxOutputTokens,
        };
        if (modelSettings.model === 'gemini-2.5-flash') {
            config.thinkingConfig = { thinkingBudget: modelSettings.thinkingBudget };
        }
        
        return geminiService.models.generateContentStream({
            model: modelSettings.model,
            contents: prompt,
            config,
        });
    };
     return performApiCall(apiClient, callLogic);
}


export async function callCreativeTextAI(
    prompt: string, 
    apiClient: ApiClient, 
    modelSettings: AiModelSettings,
    safetySettings: any
): Promise<GenerateContentResponse> {
     const callLogic = (geminiService: GoogleGenAI) => {
        const config: any = {
            safetySettings: safetySettings,
            temperature: modelSettings.temperature,
            topP: modelSettings.topP,
            topK: modelSettings.topK,
            maxOutputTokens: 1024,
        };
        if (modelSettings.model === 'gemini-2.5-flash') {
            config.thinkingConfig = { thinkingBudget: 256 };
        }

        return geminiService.models.generateContent({
            model: modelSettings.model,
            contents: prompt,
            config,
        });
    };

    const response = await performApiCall(apiClient, () => callGeminiWithRetry(apiClient, callLogic));

     if (!response.text) {
         const errorDetails = response.candidates?.[0]?.finishReason || JSON.stringify(response);
         console.error("API Error: No text in response. Details:", errorDetails);
         throw new Error(`AI không trả về nội dung văn bản. Lý do: ${errorDetails}`);
    }
    return response;
}

function sanitizeObjectRecursively(obj: any): any {
    if (typeof obj === 'string') {
        return obj.replace(/`{3,}(json)?\s*\{?\s*$/g, '').trim();
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObjectRecursively(item));
    }
    if (typeof obj === 'object' && obj !== null) {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = sanitizeObjectRecursively(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

export function parseAndValidateJsonResponse(text: string): any {
    try {
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.substring(7);
        }
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.substring(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();
        
        if (!cleanedText.startsWith('{') && !cleanedText.startsWith('[')) {
             throw new Error("Phản hồi không bắt đầu bằng '{' hoặc '['.");
        }
        const parsedJson = JSON.parse(cleanedText);
        return sanitizeObjectRecursively(parsedJson);

    } catch (e: any) {
        console.error("Failed to parse response text as JSON:", text, e);
        const errorMessage = `AI đã trả về một phản hồi JSON không hợp lệ. Điều này có thể xảy ra với các hành động phức tạp. Vui lòng thử diễn đạt lại hành động của bạn một cách khác.

--- Chi tiết kỹ thuật ---
Lỗi: ${e.message}
Dữ liệu gốc từ AI:
${text}`;
        throw new Error(errorMessage);
    }
}

export function parseNpcCreativeText(text: string): Map<string, { status: string; lastInteractionSummary: string }> {
    const npcDataMap = new Map<string, { status: string; lastInteractionSummary: string }>();
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length === 3) {
            const idPart = parts[0].match(/id:\s*(.*)/i);
            const statusPart = parts[1].match(/status:\s*(.*)/i);
            const summaryPart = parts[2].match(/summary:\s*(.*)/i);

            if (idPart?.[1] && statusPart?.[1] && summaryPart?.[1]) {
                const id = idPart[1].trim();
                const status = statusPart[1].trim();
                const lastInteractionSummary = summaryPart[1].trim();
                if (id) {
                     npcDataMap.set(id, { status, lastInteractionSummary });
                }
            }
        }
    }
    return npcDataMap;
}
