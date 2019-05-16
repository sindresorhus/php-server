'use strict';
const path = require('path');
const {spawn} = require('child_process');
const http = require('http');
const open = require('open');
const binVersionCheck = require('bin-version-check');
const getPort = require('get-port');

const isServerRunning = (hostname, port, pathname) => new Promise((resolve, reject) => {
	const retryDelay = 50;
	const maxRetries = 20; // Give up after 1 second

	let retryCount = 0;

	const checkServer = () => {
		setTimeout(() => {
			http.request({
				method: 'HEAD',
				hostname,
				port,
				path: pathname
			}, response => {
				const statusCodeType = Number(response.statusCode.toString()[0]);
				if ([2, 3, 4].includes(statusCodeType)) {
					resolve();
					return;
				}

				if (statusCodeType === 5) {
					reject(new Error('Server docroot returned 500-level response. Please check your configuration for possible errors.'));
					return;
				}

				checkServer();
			}).on('error', error => {
				if (++retryCount > maxRetries) {
					reject(new Error(`Could not start the PHP server: ${error.message}`));
					return;
				}

				checkServer();
			}).end();
		}, retryDelay);
	};

	checkServer();
});

module.exports = async options => {
	options = {
		port: 0,
		hostname: '127.0.0.1',
		base: '.',
		open: false,
		env: {},
		binary: 'php',
		directives: {},
		...options
	};

	if (options.port === 0) {
		options.port = await getPort();
	}

	const host = `${options.hostname}:${options.port}`;
	const url = `http://${host}`;

	const spawnArguments = ['-S', host];

	if (options.base) {
		spawnArguments.push('-t', path.resolve(options.base));
	}

	if (options.ini) {
		spawnArguments.push('-c', options.ini);
	}

	if (options.directives) {
		for (const [key, value] of Object.entries(options.directives)) {
			spawnArguments.push('-d', `${key}=${value}`);
		}
	}

	if (options.router) {
		spawnArguments.push(options.router);
	}

	await binVersionCheck(options.binary, '>=5.4');

	const subprocess = spawn(options.binary, spawnArguments, {
		env: {
			...process.env,
			...options.env
		}
	});

	subprocess.ref();

	process.on('exit', () => {
		subprocess.kill();
	});

	let pathname = '/';
	if (typeof options.open === 'string') {
		pathname += options.open.replace(/^\//, '');
	}

	// Check when the server is ready. Tried doing it by listening
	// to the child process `data` event, but it's not triggered...
	await isServerRunning(options.hostname, options.port, pathname);

	if (options.open) {
		await open(`${url}${pathname}`);
	}

	return {
		stdout: subprocess.stdout,
		stderr: subprocess.stderr,
		url,
		stop() {
			subprocess.kill();
		}
	};
};
