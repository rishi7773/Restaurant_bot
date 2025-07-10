const { ConversationAnalysisClient } = require("@azure/ai-language-conversations");
const { AzureKeyCredential } = require("@azure/core-auth");
require('dotenv').config();

const client = new ConversationAnalysisClient(process.env.CLU_ENDPOINT, new AzureKeyCredential(process.env.CLU_API_KEY));

async function getIntent(message) {
    try {
        // Validate input to prevent invalid text errors
        if (!message || typeof message !== 'string' || message.trim() === '') {
            console.error('Invalid or empty input text provided to CLU');
            return 'none';
        }

        const task = {
            kind: "Conversation",
            analysisInput: {
                conversationItem: {
                    id: "1",
                    participantId: "1",
                    modality: "text",
                    language: "en",
                    text: message.trim()
                }
            },
            parameters: {
                projectName: "RestaurantBot", // Ensure this matches your CLU project name
                deploymentName: "production", // Ensure this matches your CLU deployment name
                stringIndexType: "TextElement_V8",
                verbose: true
            }
        };

        const result = await client.analyzeConversation(task);

        // Check if result contains prediction data
        if (result && result.result && result.result.prediction) {
            return result.result.prediction.topIntent || 'none';
        } else {
            console.error('No prediction data in CLU response');
            return 'none';
        }
    } catch (error) {
        console.error('CLU error:', error.message);
        return 'none';
    }
}

module.exports = { getIntent };