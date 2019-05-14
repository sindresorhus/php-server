'use strict';
const phpServer = require('.');

(async () => {
	const server = await phpServer();
	console.log(`PHP server running at ${server.url}`);
})();
