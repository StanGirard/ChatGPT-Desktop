const { Configuration, OpenAIApi } = require('openai');

let openai = null;

async function setAPIKey(apiKey) {
    const configuration = new Configuration({
        apiKey,
    });

    openai = new OpenAIApi(configuration);
}

async function createChatCompletion(model, messages) {
    if (!openai) {
        alert('Please set your API key first.');
        return null;
    }

    try {
        const completion = await openai.createChatCompletion({
            model: model,
            messages: messages,
        });

        // Extract the assistant's response from the API result
        const assistantMessage =
            completion.data && completion.data.choices && completion.data.choices[0]
                ? completion.data.choices[0].message.content.trim()
                : 'Error: No response from the model.';

        return assistantMessage;
    } catch (error) {
        console.error('Error calling the OpenAI API:', error.message, error);
        return null;
    }
}

module.exports = {
    setAPIKey,
    createChatCompletion,
};