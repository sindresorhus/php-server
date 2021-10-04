import phpServer from './index.js';

// TODO: Remove the async wrapper when ESLint 8 is out.
(async () => {
	const server = await phpServer();
	console.log(`PHP server running at ${server.url}`);
})();
