import {test} from 'node:test';
import assert from 'node:assert/strict';
import phpServer from '../index.js';

test('stdout/stderr are flowing to avoid blocking', async () => {
	const server = await phpServer({base: 'test/fixtures/200'});
	try {
		assert.equal(server.stdout?.readableFlowing, true);
		assert.equal(server.stderr?.readableFlowing, true);
	} finally {
		server.stop();
	}
});
