const { initUI } = require('./ui');
const { initChat } = require('./chat');
const { initAPI } = require('./api');
const { initPrompts } = require('./prompt');


async function main() {
    initUI();
    initChat();
    initAPI();
    initPrompts();
}

main();