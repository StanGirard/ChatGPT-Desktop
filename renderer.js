const { initUI } = require('./ui');
const { initChat } = require('./chat');

async function main() {
    initUI();
    initChat();
}

main();