import { GoogleGenAI, GenerateContentResponse, EmbedContentResponse, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { AiModelSettings } from '../../types';
import { ApiStatsManager } from '../../hooks/useApiStats';

const MAX_RATE_LIMIT_RETRIES = 3;

export interface ApiClient {
    getApiClient: () => GoogleGenAI | null;
    cycleToNextApiKey: () => void;
    apiStats: ApiStatsManager;
}

async function callGeminiWithRetry<T>(
    apiClient: ApiClient,
    callFunction: (geminiService: GoogleGenAI) => Promise<T>
): Promise<T> {
    for (let i = 0; i < MAX_RATE_LIMIT_RETRIES; i++) {
        const geminiService = apiClient.getApiClient();
        if (!geminiService) {
            throw new Error("Không thể khởi tạo Gemini Client. Vui lòng kiểm tra API key.");
        }

        try {
            return await callFunction(geminiService);
        } catch (error: any) {
            const isRateLimitError = error.message && (error.message.includes('429') || error.message.includes('rate limit'));
            if (isRateLimitError && i < MAX_RATE_LIMIT_RETRIES - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.warn(`Rate limit error (429) encountered. Retrying with next key in ${Math.round(delay / 1000)}s... (Attempt ${i + 1}/${MAX_RATE_LIMIT_RETRIES})`);
                apiClient.cycleToNextApiKey(); // Cycle to the next key before retrying
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Re-throw the error if it's not a rate limit error or if it's the last retry
                throw error;
            }
        }
    }
    // This line should theoretically be unreachable
    throw new Error("Đã đạt đến số lần thử lại tối đa cho lỗi rate limit.");
}


async function performApiCall<T>(
    apiClient: ApiClient,
    callLogic: (geminiService: GoogleGenAI) => Promise<T>
): Promise<T> {
    apiClient.apiStats.recordRequestStart();
    const startTime = Date.now();
    let success = false;
    try {
        const response = await callGeminiWithRetry(apiClient, callLogic);
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
): Promise<{ parsed: any, response: GenerateContentResponse }> {
    let currentPrompt = prompt;
    const MAX_JSON_RETRIES = 2; // Initial call + 1 retry

    for (let i = 0; i < MAX_JSON_RETRIES; i++) {
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
                contents: currentPrompt,
                config,
            });
        };

        const response = await performApiCall(apiClient, callLogic);
        const responseText = (response as GenerateContentResponse).text;

        if (!responseText) {
            const finishReason = (response as GenerateContentResponse).candidates?.[0]?.finishReason;
            const errorDetails = finishReason || JSON.stringify(response);
            console.error("API Error: No text in response. Details:", errorDetails);
            
            let userMessage = `AI không trả về nội dung. Lý do: ${errorDetails}`;
            if (finishReason === 'SAFETY') {
                userMessage = "Phản hồi của AI đã bị chặn vì lý do an toàn. Vui lòng thử một hành động khác hoặc điều chỉnh cài đặt an toàn trong menu.";
            }
            // This is a hard failure (like safety), retrying won't help.
            throw new Error(userMessage);
        }

        try {
            const parsed = parseAndValidateJsonResponse(responseText);
            return { parsed, response }; // Success!
        } catch (error: any) {
            console.warn(`JSON parsing failed on attempt ${i + 1}. Error: ${error.message}`);
            if (i === MAX_JSON_RETRIES - 1) {
                // Last attempt failed, throw the user-facing error.
                console.error("All JSON parsing retries failed for non-streaming call.");
                throw new Error(`AI đã trả về một phản hồi JSON không hợp lệ sau nhiều lần thử. Lỗi: ${error.message}\n\nDữ liệu gốc từ AI:\n${responseText}`);
            }
            // Prepare for retry
            currentPrompt = `${prompt}\n\n---SYSTEM NOTE---\nYour previous response failed to parse as valid JSON. This is a critical error. You MUST regenerate the entire response and ensure it is a single, complete, valid JSON object that strictly follows the provided schema. Pay close attention to escaping double quotes (\\") within strings.\n\nHere is the invalid response you provided:\n\`\`\`\n${responseText}\n\`\`\``;
            console.log("Retrying with corrective prompt...");
        }
    }
    // Should be unreachable
    throw new Error("Lỗi logic trong cơ chế thử lại của việc gọi AI.");
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

    const response = await performApiCall(apiClient, callLogic);

    // FIX: Add type assertion to 'response' to resolve 'property does not exist on type unknown' error.
     if (!(response as GenerateContentResponse).text) {
         const errorDetails = (response as GenerateContentResponse).candidates?.[0]?.finishReason || JSON.stringify(response);
         console.error("API Error: No text in response. Details:", errorDetails);
         throw new Error(`AI không trả về nội dung văn bản. Lý do: ${errorDetails}`);
    }
    return response as GenerateContentResponse;
}

export async function callEmbeddingModel(
    text: string,
    apiClient: ApiClient,
): Promise<number[]> {
     const callLogic = (geminiService: GoogleGenAI): Promise<EmbedContentResponse> => {
        return geminiService.models.embedContent({
            model: 'text-embedding-004',
            content: text,
        });
    };
    
    const response = await performApiCall(apiClient, callLogic);
    return response.embedding.values;
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
        // More robust cleaning to find the outermost JSON object/array
        const firstBracket = cleanedText.indexOf('{');
        const firstSquare = cleanedText.indexOf('[');
        let start = -1;

        if (firstBracket === -1) start = firstSquare;
        else if (firstSquare === -1) start = firstBracket;
        else start = Math.min(firstBracket, firstSquare);

        const lastBracket = cleanedText.lastIndexOf('}');
        const lastSquare = cleanedText.lastIndexOf(']');
        const end = Math.max(lastBracket, lastSquare);
        
        if (start === -1 || end === -1) {
             throw new Error("Không tìm thấy đối tượng JSON hợp lệ trong phản hồi.");
        }

        cleanedText = cleanedText.substring(start, end + 1);
        
        const parsedJson = JSON.parse(cleanedText);
        return sanitizeObjectRecursively(parsedJson);

    } catch (e: any) {
        console.error("Failed to parse response text as JSON:", text, e);
        const errorMessage = `Lỗi phân tích cú pháp JSON: ${e.message}`;
        // Throw a more specific error for the retry logic to catch. The final user-facing error will be constructed there.
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