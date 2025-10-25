import { GoogleGenAI, GenerateContentResponse, EmbedContentResponse, HarmCategory, HarmBlockThreshold, BatchEmbedContentsResponse, ContentEmbedding } from '@google/genai';
import { AiModelSettings } from '../../types';
import { ApiStatsManager } from '../../hooks/useApiStats';

const MAX_API_RETRIES = 3;

export interface ApiClient {
    getApiClient: () => GoogleGenAI | null;
    cycleToNextApiKey: () => void;
    apiStats: ApiStatsManager;
    onApiKeyInvalid: () => void;
}

/**
 * A helper function to fix JSON strings that contain unescaped control characters
 * using a regular expression to operate only within string literals.
 * @param jsonString The potentially broken JSON string.
 * @returns A corrected JSON string.
 */
function fixJsonControlCharacters(jsonString: string): string {
    // This regex finds string literals, capturing their content. It handles escaped quotes.
    return jsonString.replace(/"((?:\\.|[^"\\])*)"/g, (match, content) => {
        // This inner replace operates only on the captured content of the string.
        const fixedContent = content.replace(/[\u0000-\u001F]/g, (char: string) => {
            switch (char) {
                case '\b': return '\\b';
                case '\f': return '\\f';
                case '\n': return '\\n';
                case '\r': return '\\r';
                case '\t': return '\\t';
                default:
                    // For other control characters, use unicode escape.
                    const hex = ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
                    return '\\u' + hex;
            }
        });
        // Reconstruct the string literal with the fixed content.
        return `"${fixedContent}"`;
    });
}


async function callGeminiWithResiliency<T>(
    apiClient: ApiClient,
    callFunction: (geminiService: GoogleGenAI) => Promise<T>
): Promise<T> {
    for (let i = 0; i < MAX_API_RETRIES; i++) {
        const geminiService = apiClient.getApiClient();
        if (!geminiService) {
            throw new Error("Không thể khởi tạo Gemini Client. Vui lòng kiểm tra API key.");
        }

        try {
            return await callFunction(geminiService);
        } catch (error: any) {
            const errorMessage = error.message || '';
            const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('rate limit');
            const isServerError = errorMessage.includes('500') || errorMessage.includes('internal error');

            if ((isRateLimitError || isServerError) && i < MAX_API_RETRIES - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                const errorType = isServerError ? "Server error (500)" : "Rate limit error (429)";
                
                console.warn(`${errorType} encountered. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${i + 1}/${MAX_API_RETRIES})`);
                
                // For rate limit errors, we also cycle the API key
                if (isRateLimitError) {
                    apiClient.cycleToNextApiKey(); 
                    console.log("Cycling to next API key.");
                }
                
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Re-throw the error if it's not a retriable error or if it's the last retry
                throw error;
            }
        }
    }
    // This line should theoretically be unreachable
    throw new Error("Đã đạt đến số lần thử lại tối đa cho lỗi API.");
}


async function performApiCall<T>(
    apiClient: ApiClient,
    callLogic: (geminiService: GoogleGenAI) => Promise<T>
): Promise<T> {
    apiClient.apiStats.recordRequestStart();
    const startTime = Date.now();
    let success = false;
    try {
        const response = await callGeminiWithResiliency(apiClient, callLogic);
        success = true;
        return response;
    } catch (e: any) {
        console.error("Lỗi gọi API:", e);
        const errorMessage = e.message || '';
        if (errorMessage.includes('API key expired') || errorMessage.includes('Requested entity was not found') || errorMessage.includes('API_KEY_INVALID')) {
            apiClient.onApiKeyInvalid();
        }
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
                maxOutputTokens: modelSettings.maxOutputTokens + (modelSettings.jsonBuffer || 0),
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
            maxOutputTokens: modelSettings.maxOutputTokens + (modelSettings.jsonBuffer || 0),
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

export async function callTextAIStream(
    prompt: string, 
    history: { role: string; parts: { text: string }[] }[],
    apiClient: ApiClient, 
    modelSettings: AiModelSettings,
    systemInstruction: string,
    safetySettings: any
): Promise<AsyncGenerator<GenerateContentResponse>> {
     const callLogic = (geminiService: GoogleGenAI) => {
        const config: any = {
            safetySettings: safetySettings,
            temperature: modelSettings.temperature,
            topP: modelSettings.topP,
            topK: modelSettings.topK,
            maxOutputTokens: modelSettings.maxOutputTokens,
            systemInstruction: systemInstruction,
        };
        if (modelSettings.model === 'gemini-2.5-flash') {
            config.thinkingConfig = { thinkingBudget: modelSettings.thinkingBudget };
        }
        
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: prompt }] }
        ];

        return geminiService.models.generateContentStream({
            model: modelSettings.model,
            contents,
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

export async function callBatchEmbeddingModel(
    texts: string[],
    apiClient: ApiClient,
): Promise<number[][]> {
     const callLogic = async (geminiService: GoogleGenAI): Promise<number[][]> => {
        const requests = texts.map(text => ({
            model: 'text-embedding-004',
            content: { parts: [{ text }] }
        }));
        
        const result: BatchEmbedContentsResponse = await geminiService.models.batchEmbedContents({ requests });
        return result.embeddings.map((e: ContentEmbedding) => e.values);
    };

    return performApiCall(apiClient, callLogic);
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
        let jsonString = text.trim();

        // 1. Check for markdown code block and extract it
        const markdownMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
        }

        // 2. More robust cleaning to find the outermost JSON object/array
        const firstBracket = jsonString.indexOf('{');
        const firstSquare = jsonString.indexOf('[');
        let start = -1;

        if (firstBracket === -1) start = firstSquare;
        else if (firstSquare === -1) start = firstBracket;
        else start = Math.min(firstBracket, firstSquare);

        const lastBracket = jsonString.lastIndexOf('}');
        const lastSquare = jsonString.lastIndexOf(']');
        const end = Math.max(lastBracket, lastSquare);
        
        if (start === -1 || end === -1) {
             throw new Error("Không tìm thấy đối tượng JSON hợp lệ trong phản hồi.");
        }

        jsonString = jsonString.substring(start, end + 1);
        
        try {
            // First attempt to parse the original cleaned text
            const parsedJson = JSON.parse(jsonString);
            return sanitizeObjectRecursively(parsedJson);
        } catch (e: any) {
             // If it fails, attempt to fix unescaped control characters which cause errors.
            if (e.message.includes('Bad control character') || e.message.includes('Unterminated string')) {
                console.warn("Initial JSON parsing failed, attempting to fix unescaped control characters...", e.message);
                const fixedText = fixJsonControlCharacters(jsonString);
                const parsedJson = JSON.parse(fixedText); // This will throw if it still fails
                return sanitizeObjectRecursively(parsedJson);
            }
            // Re-throw other parsing errors
            throw e;
        }

    } catch (e: any) {
        console.error("Failed to parse response text as JSON even after attempting fixes:", text, e);
        const errorMessage = `Lỗi phân tích cú pháp JSON: ${e.message}`;
        // Throw error for the retry logic to catch.
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