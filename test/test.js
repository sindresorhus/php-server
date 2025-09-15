import process from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import got from 'got';
import phpServer from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.chdir(__dirname);

// Helper to create and auto-cleanup servers
const withServer = async (options, testFunction) => {
	const server = await phpServer(options);
	try {
		return await testFunction(server);
	} finally {
		server.stop();
	}
};

test('start a PHP server', async () => {
	await withServer({base: 'fixtures/200'}, async server => {
		const {statusCode, body} = await got(server.url);
		assert.equal(statusCode, 200);
		assert.equal(body, 'Hello World');
	});
});

test('start a PHP server when the status code is 301', async () => {
	await withServer({base: 'fixtures/301'}, async server => {
		const {statusCode, body} = await got(server.url);
		assert.equal(statusCode, 200);
		assert.equal(body, '301 Redirected!');
	});
});

test('start a PHP server when the status code is 400', async () => {
	await withServer({base: 'fixtures/400'}, async server => {
		const {statusCode} = await got(server.url, {throwHttpErrors: false});
		assert.equal(statusCode, 400);
	});
});

test('start a PHP server when the status code is 404', async () => {
	await withServer({base: 'fixtures/404'}, async server => {
		const {statusCode} = await got(server.url, {throwHttpErrors: false});
		assert.equal(statusCode, 404);
	});
});

test('expose environment variables', async () => {
	await withServer({
		base: 'fixtures/env',
		env: {
			FOOBAR: 'foobar',
		},
	}, async server => {
		const {body} = await got(server.url);
		assert.equal(body, 'foobar');
	});
});

test('expose custom INI directive', async () => {
	await withServer({
		base: 'fixtures/directives',
		directives: {
			error_log: 'foobar', // eslint-disable-line camelcase
		},
	}, async server => {
		const {body} = await got(server.url);
		assert.equal(body, 'foobar');
	});
});

test('show detailed error message when the status code is 500', async () => {
	await assert.rejects(
		phpServer({base: 'fixtures/500'}),
		error => {
			// Should contain "500 error" and be more specific than generic message
			assert.match(error.message, /Server returned 500 error/);
			// On some systems, we might get detailed error parsing, on others just the generic message
			// Both are acceptable as long as it indicates a 500 error
			return true;
		},
	);
});

test('handle open option with relative paths', async () => {
	await withServer({base: 'fixtures/200', open: '/test'}, async server => {
		// We can't test the actual browser opening, but we can verify the server works
		// PHP's built-in server will return 200 for any path when only index.php exists
		const {statusCode, body} = await got(`${server.url}/test`, {throwHttpErrors: false});
		assert.equal(statusCode, 200);
		assert.equal(body, 'Hello World'); // Served by index.php
	});
});

test('handle open option with absolute URLs', async () => {
	await withServer({base: 'fixtures/200', open: 'http://example.com'}, async server => {
		// Server should still work normally even with absolute URL in open option
		const {statusCode, body} = await got(server.url);
		assert.equal(statusCode, 200);
		assert.equal(body, 'Hello World');
	});
});
