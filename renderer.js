const { initUI } = require('./ui');
const { initChat } = require('./chat');
const { initAPI } = require('./api');

async function main() {
    initUI();
    initChat();
    initAPI();

}

main();