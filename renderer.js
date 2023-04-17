const { Configuration, OpenAIApi } = require('openai');

const chats = {};
let currentChatId = null; // Add this line

let openai = null;

const modelSelect = document.getElementById('model-select');
const apiKeyInput = document.getElementById('api-key-input');
const apiKeySubmit = document.getElementById('api-key-submit');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatContainer = document.getElementById('chat-container');

apiKeySubmit.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return;

    const configuration = new Configuration({
        apiKey,
    });

    openai = new OpenAIApi(configuration);

    // Show a success message or any other indication that the key is set
    alert('API key set successfully');
});

sendButton.addEventListener('click', async () => {
    // Check if the OpenAI API instance is available
    if (!openai) {
        alert('Please set your API key first.');
        return;
    }

    const model = chats[currentChatId].model;
    const message = userInput.value;

    if (!message) return;

    // Clear the input field
    userInput.value = '';

    // Add user message to chat container and message history
    addUserMessageToChat(message, currentChatId);

    // Call the OpenAI API with the entire message history
    try {
        const completion = await openai.createChatCompletion({
            model: model,
            messages: chats[currentChatId].messages,
        });

        // Extract the assistant's response from the API result
        const assistantMessage =
            completion.data && completion.data.choices && completion.data.choices[0]
                ? completion.data.choices[0].message.content.trim()
                : 'Error: No response from the model.';

        // Add assistant message to chat container and message history
        addAssistantMessageToChat(assistantMessage, currentChatId);

    } catch (error) {
        console.error('Error calling the OpenAI API:', error);
        alert('An error occurred while calling the OpenAI API. Check the console for details.');
    }
});


function displayMessage(role, messageContent, chatId) {
    const messageElement = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = role === 'user' ? 'user.png' : 'assistant.png';
    imgElement.classList.add('message-img');
    messageElement.appendChild(imgElement);
    const messageText = document.createElement('span');
    messageText.textContent = `${messageContent}`;
    messageElement.appendChild(messageText);

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (role === 'user') {
        updateChatSessions(chatId);
    }
}

function updateChatSessions(chatId) {
    const chatSessions = document.getElementById('chat-sessions');
    let chatButton = document.getElementById(`chat-button-${chatId}`);

    if (!chatButton) {
        chatButton = document.createElement('button');
        chatButton.id = `chat-button-${chatId}`;
        chatButton.textContent = chatId;
        chatButton.addEventListener('click', () => {
            switchChatSession(chatId);
        });
        chatSessions.appendChild(chatButton);
    }
}

function switchChatSession(chatId) {
    const chatSession = chats[chatId];

    if (!chatSession) return;

    // Set the current chat ID
    currentChatId = chatId;

    // Clear the chat container
    chatContainer.innerHTML = '';

    // Add messages from the selected chat session
    for (const message of chatSession.messages) {
        displayMessage(message.role, message.content, chatId);
    }
}


const newChatSessionButton = document.getElementById('new-chat-session-button');

newChatSessionButton.addEventListener('click', () => {
    createNewChatSession();
});

function createNewChatSession() {
    const chatId = `chat-${Object.keys(chats).length + 1}`;
    const model = modelSelect.value;

    chats[chatId] = {
        model: model,
        messages: [],
    };

    currentChatId = chatId; // Add this line to set the current chat ID

    updateChatSessions(chatId);
    switchChatSession(chatId);
}

function addUserMessageToChat(message, chatId) {
    const chatSession = chats[chatId];
    if (!chatSession) return;

    chatSession.messages.push({ role: 'user', content: message });
    displayMessage('user', message, chatId);
}

function addAssistantMessageToChat(message, chatId) {
    const chatSession = chats[chatId];
    if (!chatSession) return;

    chatSession.messages.push({ role: 'assistant', content: message });
    displayMessage('assistant', message, chatId);
}

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

createNewChatSession();