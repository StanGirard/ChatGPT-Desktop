const { createChatCompletion } = require('./api');

let chats = {};
let currentChatId = null;

function displayMessage(role, messageContent, chatId) {
    const chatContainer = document.getElementById('chat-container');
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
}


function updateLastMessage(chatId, updatedMessage) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // Get the last message element in the chat container
    const lastMessageElement = chatContainer.lastElementChild;

    if (lastMessageElement) {
        // Get the <span> element containing the message text
        const messageTextElement = lastMessageElement.querySelector('span');
        if (messageTextElement) {
            // Update the text content of the message text element with the updated message content
            messageTextElement.textContent = updatedMessage.content;
        }
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
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';

    // Add messages from the selected chat session
    for (const message of chatSession.messages) {
        if (message.role === 'system') {
            continue;
        }
        displayMessage(message.role, message.content, chatId);
    }
}

function createNewChatSession() {
    const modelSelect = document.getElementById('model-select');
    const chatId = `chat-${Object.keys(chats).length + 1}`;
    const model = modelSelect.value;

    chats[chatId] = {
        model: model,
        messages: [{ "role": "system", "content": "You talk like a 3 years old" }],
    };

    currentChatId = chatId;

    updateChatSessions(chatId);
    switchChatSession(chatId);
}

function addUserMessageToChat(message) {
    const chatSession = chats[currentChatId];
    if (!chatSession) return;

    chatSession.messages.push({ role: 'user', content: message });
    displayMessage('user', message, currentChatId);
}

async function addAssistantMessageToChat(message) {
    const chatSession = chats[currentChatId];
    if (!chatSession) return;

    const model = chatSession.model;
    const messages = chatSession.messages;

    let consolidatedMessage = null

    await createChatCompletion(model, messages, (assistantMessage) => {
        if (assistantMessage) {
            let latestMessage = chatSession.messages[chatSession.messages.length - 1];
            console.log(assistantMessage)
            if (latestMessage.role === 'assistant' || latestMessage.role === 'system') {
                // If the latest message is from the assistant or system, update it
                latestMessage.content += assistantMessage;
                consolidatedMessage = latestMessage.content;
                updateLastMessage(currentChatId, latestMessage);
            } else {
                // If the latest message is not from the assistant or system, create a new message
                const newAssistantMessage = { role: 'assistant', content: assistantMessage };
                chatSession.messages.push(newAssistantMessage);
                displayMessage('assistant', assistantMessage, currentChatId);
                // Update the reference to the latest message
                latestMessage = newAssistantMessage;
                consolidatedMessage = newAssistantMessage;
            }
        }
    });
    return consolidatedMessage;
}

function initChat() {
    createNewChatSession();
}

module.exports = {
    initChat,
    displayMessage,
    addUserMessageToChat,
    addAssistantMessageToChat,
    updateChatSessions,
    switchChatSession,
    createNewChatSession,
    updateLastMessage
};