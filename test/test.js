import process from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import test from 'ava';
import got from 'got';
import phpServer from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.chdir(__dirname);

test('start a PHP server', async t => {
	const server = await phpServer({base: 'fixtures/200'});
	const {statusCode, body} = await got(server.url);
	t.is(statusCode, 200);
	t.is(body, 'Hello World');
	server.stop();
});

test('start a PHP server when the status code is 301', async t => {
	const server = await phpServer({base: 'fixtures/301'});
	const {statusCode, body} = await got(server.url);
	t.is(statusCode, 200);
	t.is(body, '301 Redirected!');
	server.stop();
});

test('start a PHP server when the status code is 400', async t => {
	const server = await phpServer({base: 'fixtures/400'});
	const {statusCode} = await got(server.url, {throwHttpErrors: false});
	t.is(statusCode, 400);
	server.stop();
});

test('start a PHP server when the status code is 404', async t => {
	const server = await phpServer({base: 'fixtures/404'});
	const {statusCode} = await got(server.url, {throwHttpErrors: false});
	t.is(statusCode, 404);
	server.stop();
});

test('expose environment variables', async t => {
	const server = await phpServer({
		base: 'fixtures/env',
		env: {
			FOOBAR: 'foobar',
		},
	});
	const {body} = await got(server.url);
	t.is(body, 'foobar');
	server.stop();
});

test('expose custom INI directive', async t => {
	const server = await phpServer({
		base: 'fixtures/directives',
		directives: {
			error_log: 'foobar', // eslint-disable-line camelcase
		},
	});
	const {body} = await got(server.url);
	t.is(body, 'foobar');
	server.stop();
});
