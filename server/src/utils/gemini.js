const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// INSTRUKSI RAHASIA BUAT GENERATE GAMBAR
const IMAGE_GEN_INSTRUCTION = `
IMPORTANT: If the user explicitly asks you to generate, create, draw, or visualize an image, DO NOT provide a text response. Instead, you must reply with ONLY a special command format: "IMAGE_GEN: <detailed English description of the image>". 
Example user: "Buatin gambar kucing hacker." -> Your reply: "IMAGE_GEN: a cool hacker cat wearing a hoodie and sunglasses sitting in front of multiple monitors with green code, cyberpunk atmosphere, high detail."
For any other request, reply normally with text.
`;

// === FUNGSI BARU: BIKIN RANGKUMAN (MEMORI) ===
const summarizeChat = async (currentSummary, newMessages) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const textToSummarize = `
    CURRENT SUMMARY: ${currentSummary || "None"}
    NEW MESSAGES: ${newMessages}
    
    INSTRUCTION: Create a concise summary of the conversation above. Preserve key details like user's name, preferences, and main topics. The summary should be in the same language as the conversation.
    `;

    try {
        const result = await model.generateContent(textToSummarize);
        return result.response.text();
    } catch (error) {
        console.error("Gagal merangkum:", error);
        return currentSummary; 
    }
};

const getGeminiResponse = async (prompt, history, mode, filePart = null, memory = "") => {
    // 1. Definisikan Karakter AI
    let baseInstruction = "";
    switch (mode) {
        case 'coding': baseInstruction = "You are MengAi, an expert Senior Software Engineer. Provide complete, clean, and optimized code. Explain briefly."; break;
        case 'guru': baseInstruction = "You are MengAi, a patient and knowledgeable teacher. Explain concepts simply for students."; break;
        case 'pacar': baseInstruction = "Kamu adalah MengAi, pacar virtual yang perhatian, manja, dan suportif. Panggil user dengan panggilan sayang."; break;
        case 'motivator': baseInstruction = "You are MengAi, a fierce motivator. Push the user to be their best self."; break;
        case 'analisis': baseInstruction = "You are MengAi, a data analyst. Analyze inputs deeply and provide structured insights."; break;
        default: baseInstruction = "You are MengAi, a helpful, Gen Z friendly AI assistant. Use slang modestly but stay helpful. You have access to Google Search, use it for real-time information."; break;
    }

    // Gabungin instruksi karakter + instruksi gambar + MEMORI
    const finalSystemInstruction = `
    ${baseInstruction}
    
    [LONG TERM MEMORY / CONTEXT]:
    ${memory ? memory : "No previous context."}
    
    ${IMAGE_GEN_INSTRUCTION}
    `;

    try {
        let result;

        // === SKENARIO 1: USER UPLOAD GAMBAR/AUDIO ===
        if (filePart && (filePart.isImage || filePart.isAudio)) {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash", 
                systemInstruction: { parts: [{ text: finalSystemInstruction }] }
            });
            
            const userPrompt = prompt || (filePart.isAudio ? "Dengarkan audio ini dan tanggapi dengan relevan." : "Jelaskan gambar ini.");
            result = await model.generateContent([userPrompt, filePart.data]);
        } 
        
        // === SKENARIO 2: TEKS BIASA / PDF (SEARCH REALTIME) ===
        else {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash", 
                systemInstruction: { parts: [{ text: finalSystemInstruction }] },
                tools: [{ googleSearch: {} }] 
            });

            const chat = model.startChat({ history: history });

            let finalPrompt = prompt;
            if (filePart && filePart.text) {
                finalPrompt = `${prompt}\n\n=== KONTEKS DARI DOKUMEN USER ===\n${filePart.text}\n===============================`;
            }

            result = await chat.sendMessage(finalPrompt);
        }

        return result.response.text();

    } catch (error) {
        console.error("Gemini Error:", error);
        return "Aduh, MengAi lagi pusing (Error koneksi ke AI). Coba lagi ya!";
    }
};

module.exports = { getGeminiResponse, summarizeChat };