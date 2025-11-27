/**
 * Gemini AI Service Configuration
 * Using Gemini 2.5 Flash for optimal balance of reasoning and speed
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini 1.5 Flash model (stable, higher rate limits)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate AI content using Gemini
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Additional options
 * @returns {Promise<string>} - Generated text response
 */
async function generateContent(prompt, options = {}) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini AI Error:', error);
        throw new Error('Failed to generate AI content');
    }
}

/**
 * Generate structured JSON response from Gemini
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<object>} - Parsed JSON response
 */
async function generateJSON(prompt) {
    try {
        const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just pure JSON.`;
        const text = await generateContent(fullPrompt);
        
        // Clean up response - remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```\n?/g, '');
        }
        
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Gemini JSON Parse Error:', error);
        throw new Error('Failed to generate structured AI response');
    }
}

/**
 * Chat with Gemini (for chatbot functionality)
 * @param {string} message - User message
 * @param {array} history - Chat history
 * @returns {Promise<string>} - AI response
 */
async function chat(message, history = []) {
    try {
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        throw new Error('Failed to process chat message');
    }
}

module.exports = {
    generateContent,
    generateJSON,
    chat,
    model
};
