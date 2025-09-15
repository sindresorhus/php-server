import {test} from 'node:test';
import assert from 'node:assert/strict';

// Test the URL parsing logic
test('open option URL parsing', () => {
	// Test absolute URL detection
	const absoluteUrls = [
		'http://localhost:3000',
		'https://example.com',
		'http://127.0.0.1:8080/path',
	];

	for (const url of absoluteUrls) {
		try {
			// eslint-disable-next-line no-new
			new URL(url);
			assert.ok(true, `${url} is correctly identified as absolute`);
		} catch {
			assert.fail(`${url} should be parsed as absolute URL`);
		}
	}

	// Test relative path detection
	const relativePaths = [
		'/about',
		'page.php',
		'admin/dashboard',
		'index.html',
	];

	for (const path of relativePaths) {
		try {
			// eslint-disable-next-line no-new
			new URL(path);
			assert.fail(`${path} should not be parsed as absolute URL`);
		} catch {
			assert.ok(true, `${path} is correctly identified as relative`);
		}
	}
});

test('pathname extraction from absolute URLs', () => {
	const testCases = [
		{url: 'http://localhost:3000', expectedPath: '/'},
		{url: 'http://localhost:3000/', expectedPath: '/'},
		{url: 'http://localhost:3000/about', expectedPath: '/about'},
		{url: 'https://example.com/path/to/page', expectedPath: '/path/to/page'},
	];

	for (const {url, expectedPath} of testCases) {
		const parsedUrl = new URL(url);
		assert.equal(parsedUrl.pathname, expectedPath, `Pathname for ${url} should be ${expectedPath}`);
	}
});
