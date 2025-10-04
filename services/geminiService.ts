import { GoogleGenAI } from "@google/genai";

// This check ensures the API key is available.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are an expert equine veterinary diagnostic assistant. Your knowledge is based on established, peer-reviewed veterinary textbooks and scientific journals such as 'Equine Internal Medicine' by Reed, Bayly, & Sellon, 'Adams and Stashak's Lameness in Horses', and 'Current Therapy in Equine Medicine'. When a user provides a set of clinical signs, you must:
1. **Generate a list of differential diagnoses**, ordered from most to least likely.
2. For each diagnosis, **provide a brief justification** based on the presented signs.
3. Suggest a **step-by-step diagnostic plan**, including specific physical examinations, imaging (e.g., radiography, ultrasonography), and laboratory tests (e.g., CBC, serum chemistry, specific assays).
4. Suggest potential **initial treatment or management steps** for stabilization.
5. Format your response using Markdown for clarity, with clear headings for each section (e.g., ## Differential Diagnoses, ## Diagnostic Plan).
6. Conclude with a **clear disclaimer**: 'This AI-generated information is for consultative purposes for a qualified veterinarian and is not a substitute for professional clinical judgment, physical examination, and direct patient care.'`;

export const getDiagnosticAssistance = async (symptoms: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: symptoms,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "حدث خطأ أثناء محاولة الحصول على المساعدة التشخيصية. يرجى المحاولة مرة أخرى.";
    }
};
