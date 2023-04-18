const { Configuration, OpenAIApi } = require('openai');

let openai = null;

// Set the API key for OpenAI
async function setAPIKey(apiKey) {
    const configuration = new Configuration({
        apiKey,
    });

    openai = new OpenAIApi(configuration);
}

// Create a chat completion using OpenAI API
async function createChatCompletion(model, messages, onResponse) {
    if (!openai) {
        alert('Please set your API key first.');
        return null;
    }

    const url = `https://api.openai.com/v1/chat/completions`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${openai.configuration.apiKey}`);

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ model, messages, stream: true }),
    };

    try {
        const response = await fetch(url, requestOptions);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const payloads = buffer.split('\n\n');
            buffer = payloads.pop();

            for (const payload of payloads) {
                if (payload.includes('[DONE]')) return;
                if (payload.startsWith('data:')) {
                    const data = payload.replace(/(\n)?^data:\s*/g, '');
                    try {
                        const delta = JSON.parse(data.trim());
                        onResponse(delta.choices && delta.choices.length > 0 && delta.choices[0].delta ? delta.choices[0].delta.content : null);
                    } catch (error) {
                        console.log(`Error with JSON.parse and ${payload}`, error.message, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error calling the OpenAI API:', error);
    }
}

// Initialize the API
function initAPI() {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
        setAPIKey(apiKey);
        const apiKeyInput = document.getElementById('api-key-input');
        apiKeyInput.value = apiKey;
    }
}

module.exports = {
    setAPIKey,
    createChatCompletion,
    initAPI,
};