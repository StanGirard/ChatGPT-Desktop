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
    const stream = await createChatCompletion(model, chatSession.messages);
  
    if (!stream) return;
  
    stream.on('data', (chunk) => {
      const assistantMessage = chunk.toString();
      if (assistantMessage.trim() === '[DONE]') {
        stream.destroy();
      } else {
        chatSession.messages.push({ role: 'assistant', content: assistantMessage });
        displayMessage('assistant', assistantMessage, currentChatId);
      }
    });
  
    stream.on('error', (err) => {
      console.error('Error while streaming chat completion:', err);
    });
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
};