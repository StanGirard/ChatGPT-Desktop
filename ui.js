const {
    addUserMessageToChat,
    addAssistantMessageToChat,
    createNewChatSession,
} = require('./chat');
const { setAPIKey } = require('./api');


function initUI() {
    const modelSelect = document.getElementById('model-select');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKeySubmit = document.getElementById('api-key-submit');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatContainer = document.getElementById('chat-container');
    const newChatSessionButton = document.getElementById('new-chat-session-button');

    apiKeySubmit.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) return;

        setAPIKey(apiKey);

        // Show a success message or any other indication that the key is set
        alert('API key set successfully');
    });

    sendButton.addEventListener('click', async () => {
        const message = userInput.value;

        if (!message) return;

        // Clear the input field
        userInput.value = '';

        // Add user message to chat container and message history
        addUserMessageToChat(message);

        // Get assistant message
        const assistantMessage = await addAssistantMessageToChat(message);

        if (!assistantMessage) {
            alert('An error occurred while calling the OpenAI API. Check the console for details.');
        }
    });

    newChatSessionButton.addEventListener('click', () => {
        createNewChatSession();
    });

    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (!event.shiftKey) {
                event.preventDefault(); // Prevent newline from being added to the input
                sendButton.click();
            } else {
                userInput.value += '\n';
                event.preventDefault();
            }
        }
    });
}

module.exports = {
    initUI,
};