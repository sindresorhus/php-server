import phpServer from './index.js';

const server = await phpServer();
console.log(`PHP server running at ${server.url}`);
