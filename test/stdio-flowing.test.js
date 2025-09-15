import process from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import phpServer from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.chdir(__dirname);

test('stdout/stderr are flowing to avoid blocking', async () => {
	const server = await phpServer({base: 'fixtures/200'});
	try {
		assert.equal(server.stdout?.readableFlowing, true);
		assert.equal(server.stderr?.readableFlowing, true);
	} finally {
		server.stop();
	}
});
