const { createChatCompletion } = require('./api');

let chats = {};
let currentChatId = null;

const MarkdownIt = require('markdown-it');
const markdownItSanitizer = require('markdown-it-sanitizer');
const md = new MarkdownIt().use(markdownItSanitizer);

function displayMessage(role, messageContent, chatId) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    const imgElement = document.createElement('img');
    imgElement.src = role === 'user' ? 'user.png' : 'assistant.png';
    imgElement.classList.add('message-img');
    messageElement.appendChild(imgElement);
    
    // Convert markdown to HTML
    const htmlContent = md.render(messageContent);

    // Create a <div> element to hold the HTML content
    const messageText = document.createElement('div');
    messageText.innerHTML = htmlContent;
    const messageContentWrapper = document.createElement('div');
    messageContentWrapper.classList.add('message-content-wrapper');
    messageContentWrapper.appendChild(imgElement);
    messageContentWrapper.appendChild(messageText);

    messageElement.appendChild(messageContentWrapper);

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


function updateLastMessage(chatId, updatedMessage) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // Get the last message element in the chat container
    const lastMessageElement = chatContainer.lastElementChild;

    if (lastMessageElement) {
        // Get the <div> element containing the message text
        const messageTextElement = lastMessageElement.querySelector('div');
        if (messageTextElement) {
            // Render the updated message content using the Markdown parser
            const renderedContent = md.render(updatedMessage.content);

            // Update the innerHTML of the message text element with the rendered content
            messageTextElement.innerHTML = renderedContent;
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

        // Add delete icon to chat session button
        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('delete-icon');
        deleteIcon.innerHTML = '&#x1F5D1;'; // Trash can emoji
        deleteIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent switching to the chat session when the icon is clicked
            deleteChatSession(chatId);
        });

        chatButton.appendChild(deleteIcon);
        chatSessions.appendChild(chatButton);
    }
}

function deleteChatSession(chatId) {
    // Show a confirmation popup
    const confirmDeletion = confirm('Are you sure you want to delete this chat session?');

    if (!confirmDeletion) {
        return;
    }

    const chatSessions = document.getElementById('chat-sessions');
    const chatButton = document.getElementById(`chat-button-${chatId}`);

    if (chatButton) {
        // Remove the chat button from the chat sessions list
        chatSessions.removeChild(chatButton);
    }

    // Remove the chat session from the chats object
    delete chats[chatId];

    // If the deleted chat session is the current one, switch to the first available chat session
    if (chatId === currentChatId) {
        const firstChatId = Object.keys(chats)[0];
        switchChatSession(firstChatId);
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

    saveChatsToLocalStorage(); // Add this line

    currentChatId = chatId;

    updateChatSessions(chatId);
    switchChatSession(chatId);
}

function addUserMessageToChat(message) {
    const chatSession = chats[currentChatId];
    if (!chatSession) return;

    chatSession.messages.push({ role: 'user', content: message });
    saveChatsToLocalStorage(); // Add this line
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
            saveChatsToLocalStorage()
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

function saveChatsToLocalStorage() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

function loadChatsFromLocalStorage() {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
        for (const chatId in chats) {
            updateChatSessions(chatId);
        }
    }
}



function initChat() {
    loadChatsFromLocalStorage();

    if (Object.keys(chats).length === 0) {
        createNewChatSession();
    } else {
        // Switch to the last chat session in the list
        const lastChatId = Object.keys(chats)[Object.keys(chats).length - 1];
        switchChatSession(lastChatId);
    }
}

module.exports = {
    initChat,
    displayMessage,
    addUserMessageToChat,
    addAssistantMessageToChat,
    updateChatSessions,
    switchChatSession,
    createNewChatSession,
    updateLastMessage,
    deleteChatSession
};