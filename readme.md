# php-server [![Build Status](https://travis-ci.com/sindresorhus/php-server.svg?branch=master)](https://travis-ci.com/sindresorhus/php-server)

> Start a [PHP server](https://php.net/manual/en/features.commandline.webserver.php)

Uses PHP's built-in development web server (not for production use).

The Node.js process is automatically kept alive as long as the PHP server is running.


## Install

```
$ npm install php-server
```


## Usage

```js
const phpServer = require('php-server');

(async () => {
	const server = await phpServer();
	console.log(`PHP server running at ${server.url}`)
})();
```


## API

### phpServer([options])

Returns an object with the following properties:

- `stdout` - The [`subprocess.stdout`](https://nodejs.org/api/child_process.html#child_process_subprocess_stdout).
- `stderr` - The [`subprocess.stderr`](https://nodejs.org/api/child_process.html#child_process_subprocess_stderr).
- `url` - URL to the server.
- `stop()` - Stop the server.

#### options

Type: `object`

##### port

Type: `number`<br>
Default: `0`

The port on which you want to access the server.

Specify `0` to use a random port.

##### hostname

Type: `string`<br>
Default: `'127.0.0.1'` *(Usually the same as `localhost`)*

The hostname the server will use.

Use `'0.0.0.0'` if you want it to be accessible from the outside.

##### base

Type: `string`<br>
Default: `'.'`

The directory the server will serve from.

##### open

Type: `boolean | string`<br>
Default: `false`

Open the server URL in the browser.

Can be one of the following:
- `true`: Opens the default server URL (`http://${hostname}${port}`).
- A relative URL: Opens that URL in the browser. Useful when testing pages that are not the default.

##### env

Type: `object`<br>
Default: `{}`

Set environment variables for the PHP process.

##### router

Type: `string`

Optionally specify the path to a [router script](https://php.net/manual/en/features.commandline.webserver.php#example-412) that is run at the start of each HTTP request. If this script returns `false`, the requested resource is returned as-is. Otherwise, the script's output is returned to the browser.

Example router script:

```php
<?php
// router.php
if (preg_match('/\.(?:png|jpg|jpeg|gif)$/', $_SERVER["REQUEST_URI"])) {
	return false; // Serve the requested resource as-is
} else {
	echo "<p>Thanks for using php-server :)</p>";
}
?>
```

##### binary

Type: `string`<br>
Default: `'php'` *(The one in your `$PATH`)*

Path to the PHP binary.

Can be useful if you have multiple versions of PHP installed.

##### ini

Type: `string`<br>
Default: The built-in `php.ini`

Path to a custom [`php.ini` config file](https://php.net/manual/en/ini.php).

##### directives

Type: `object`<br>
Default: `{}`

Add custom [INI directives](https://php.net/manual/en/ini.list.php).


## Related

- [grunt-php](https://github.com/sindresorhus/grunt-php) - Grunt plugin that uses this package


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
