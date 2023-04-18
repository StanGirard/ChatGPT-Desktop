const { Configuration, OpenAIApi } = require('openai');
const { IncomingMessage } = require('http');

let openai = null;

async function setAPIKey(apiKey) {
    const configuration = new Configuration({
        apiKey,
    });

    openai = new OpenAIApi(configuration);
}

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

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const payloads = decoder.decode(value).split('\n\n');
            for (const payload of payloads) {
                if (payload.includes('[DONE]')) return;
                if (payload.startsWith('data:')) {
                    const data = payload.replace(/(\n)?^data:\s*/g, '');
                    try {
                        const delta = JSON.parse(data.trim());
                        onResponse(delta.choices[0].message?.content);
                    } catch (error) {
                        console.log(`Error with JSON.parse and ${payload}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error calling the OpenAI API:', error);
    }
}



module.exports = {
    setAPIKey,
    createChatCompletion,
};