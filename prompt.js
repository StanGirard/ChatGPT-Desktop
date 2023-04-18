const prompts = [
    {
        name: 'Prompt 1',
        description: 'Description for Prompt 1',
        prompt: 'This is the prompt text for Prompt 1.',
        author: 'Author 1',
    },
    {
        name: 'Prompt 2',
        description: 'Description for Prompt 2',
        prompt: 'This is the prompt text for Prompt 2.',
        author: 'Author 2',
    },
    // Add more prompts as needed
];

function initPrompts() {
    const promptList = document.getElementById('prompt-list');
    if (!promptList) return;

    for (const prompt of prompts) {
        const listItem = document.createElement('div');
        listItem.classList.add('prompt-list-item');

        const promptName = document.createElement('div');
        promptName.classList.add('prompt-name');
        promptName.textContent = prompt.name;
        listItem.appendChild(promptName);

        const promptDescription = document.createElement('div');
        promptDescription.classList.add('prompt-description');
        promptDescription.textContent = prompt.description;
        listItem.appendChild(promptDescription);

        listItem.addEventListener('click', () => {
            insertPromptIntoTextarea(prompt.prompt);
        });

        promptList.appendChild(listItem);
    }
}

function insertPromptIntoTextarea(promptText) {
    const userInput = document.getElementById('user-input');
    if (!userInput) return;

    userInput.value = promptText;
}

module.exports = {
    initPrompts,
};