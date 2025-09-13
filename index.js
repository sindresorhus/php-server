import process from 'node:process';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {setTimeout} from 'node:timers/promises';
import open from 'open';
import binaryVersionCheck from 'binary-version-check';
import getPort from 'get-port';

const isServerRunning = (hostname, port, pathname) => new Promise((resolve, reject) => {
	(async () => {
		const retryDelay = 50;
		const maxRetries = 20; // Give up after 1 second
		let retryCount = 0;

		const fetchErrorDetails = async statusCode => {
			try {
				const response = await fetch(`http://${hostname}:${port}${pathname}`);
				const body = await response.text();
				// Extract the error message from the HTML response
				// PHP errors are wrapped in <b> tags: "<b>Fatal error</b>: ..."
				const errorMatch = body.match(/<b>(Fatal error|Parse error|Warning|Notice)<\/b>:\s*([^<\n]+)/);
				if (errorMatch) {
					return `Server returned ${statusCode} error: ${errorMatch[1]}: ${errorMatch[2]}`;
				}

				return `Server returned ${statusCode} error. Please check your PHP application for possible errors.`;
			} catch {
				return `Server returned ${statusCode} error. Could not fetch error details.`;
			}
		};

		const checkServer = async () => {
			try {
				const response = await fetch(`http://${hostname}:${port}${pathname}`, {
					method: 'HEAD',
				});

				const statusCodeType = Number.parseInt(response.status.toString()[0], 10);
				if ([2, 3, 4].includes(statusCodeType)) {
					resolve();
					return;
				}

				if (statusCodeType === 5) {
					const errorMessage = await fetchErrorDetails(response.status);
					reject(new Error(errorMessage));
					return;
				}

				await setTimeout(retryDelay);
				await checkServer();
			} catch (error) {
				if (++retryCount > maxRetries) {
					reject(new Error(`Could not start the PHP server: ${error.message}`));
					return;
				}

				await setTimeout(retryDelay);
				await checkServer();
			}
		};

		await checkServer();
	})();
});

export default async function phpServer(options) {
	options = {
		port: 0,
		hostname: '127.0.0.1',
		base: '.',
		open: false,
		env: {},
		binary: 'php',
		directives: {},
		...options,
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

	await binaryVersionCheck(options.binary, '>=5.4');

	const subprocess = spawn(options.binary, spawnArguments, {
		env: {
			...process.env,
			...options.env,
		},
	});

	// Drain stdout/stderr to prevent the child process from blocking if nothing reads them.
	// Users can still attach listeners on these streams as needed.
	// See https://github.com/sindresorhus/php-server/issues/6
	if (subprocess.stdout) {
		subprocess.stdout.resume();
	}

	if (subprocess.stderr) {
		subprocess.stderr.resume();
	}

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
	try {
		await isServerRunning(options.hostname, options.port, pathname);
	} catch (error) {
		subprocess.kill();
		throw error;
	}

	if (options.open) {
		await open(`${url}${pathname}`);
	}

	return {
		stdout: subprocess.stdout,
		stderr: subprocess.stderr,
		url,
		stop() {
			subprocess.kill();
		},
	};
}
