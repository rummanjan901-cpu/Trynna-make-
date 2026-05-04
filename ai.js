/**
 * AI Service Module
 * Handles communication with OpenAI API using Fetch
 */

const API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
};

// 1. Summarize Text (Strict 5-line limit)
export const summarizeText = async (text) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{
                    role: "system", 
                    content: "Summarize the following text in exactly 5 bullet points."
                }, {
                    role: "user", 
                    content: text
                }],
                temperature: 0.7
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Summarization failed:", error);
        return "Error generating summary.";
    }
};

// 2. Generate Quiz (3 MCQs in JSON format)
export const generateQuiz = async (text) => {
    const prompt = `Based on this text, generate 3 Multiple Choice Questions. 
    Format as a JSON array of objects: 
    [{ "question": "", "options": ["A", "B", "C", "D"], "answer": "correct_option" }]`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: `${prompt}\n\nText: ${text}` }],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("Quiz generation failed:", error);
        return [];
    }
};

// 3. Chat Assistant Response
export const getAIResponse = async (message) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful study assistant. Keep answers concise." },
                    { role: "user", content: message }
                ]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Chat failed:", error);
        return "I'm having trouble connecting right now.";
    }
};

// 4. Extract Text From Image (OCR Simulation)
// Real OCR requires GPT-4o with vision or a dedicated service like Tesseract.js
export const extractTextFromImage = async (imageFile) => {
    console.log("Processing image:", imageFile.name);
    
    // Placeholder simulation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("This is simulated text extracted from the image. In a real app, you would send the base64 image to GPT-4o-vision or a specialized OCR API.");
        }, 1500);
    });
};
