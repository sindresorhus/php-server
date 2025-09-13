import process from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import got from 'got';
import phpServer from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.chdir(__dirname);

// Track all servers created during tests
const activeServers = new Set();

// Cleanup hook to ensure all servers are stopped
after(() => {
	for (const server of activeServers) {
		server.stop();
	}

	activeServers.clear();
});

test('start a PHP server', async () => {
	const server = await phpServer({base: 'fixtures/200'});
	activeServers.add(server);
	const {statusCode, body} = await got(server.url);
	assert.equal(statusCode, 200);
	assert.equal(body, 'Hello World');
	server.stop();
	activeServers.delete(server);
});

test('start a PHP server when the status code is 301', async () => {
	const server = await phpServer({base: 'fixtures/301'});
	activeServers.add(server);
	const {statusCode, body} = await got(server.url);
	assert.equal(statusCode, 200);
	assert.equal(body, '301 Redirected!');
	server.stop();
	activeServers.delete(server);
});

test('start a PHP server when the status code is 400', async () => {
	const server = await phpServer({base: 'fixtures/400'});
	activeServers.add(server);
	const {statusCode} = await got(server.url, {throwHttpErrors: false});
	assert.equal(statusCode, 400);
	server.stop();
	activeServers.delete(server);
});

test('start a PHP server when the status code is 404', async () => {
	const server = await phpServer({base: 'fixtures/404'});
	activeServers.add(server);
	const {statusCode} = await got(server.url, {throwHttpErrors: false});
	assert.equal(statusCode, 404);
	server.stop();
	activeServers.delete(server);
});

test('expose environment variables', async () => {
	const server = await phpServer({
		base: 'fixtures/env',
		env: {
			FOOBAR: 'foobar',
		},
	});
	activeServers.add(server);
	const {body} = await got(server.url);
	assert.equal(body, 'foobar');
	server.stop();
	activeServers.delete(server);
});

test('expose custom INI directive', async () => {
	const server = await phpServer({
		base: 'fixtures/directives',
		directives: {
			error_log: 'foobar', // eslint-disable-line camelcase
		},
	});
	activeServers.add(server);
	const {body} = await got(server.url);
	assert.equal(body, 'foobar');
	server.stop();
	activeServers.delete(server);
});

test('show detailed error message when the status code is 500', async () => {
	await assert.rejects(
		phpServer({base: 'fixtures/500'}),
		error => {
			// Should contain "Fatal error" and "undefined_function"
			assert.match(error.message, /500 error: Fatal error/);
			assert.match(error.message, /undefined_function/);
			return true;
		},
	);
});
