# php-server

> Start a [PHP server](https://php.net/manual/en/features.commandline.webserver.php)

Uses PHP's built-in development web server (not for production use).

The Node.js process is automatically kept alive as long as the PHP server is running.

## Install

```sh
npm install php-server
```

## Usage

```js
import phpServer from 'php-server';

const server = await phpServer();
console.log(`PHP server running at ${server.url}`);
```

## API

### phpServer(options?)

Returns an object with the following properties:

- `stdout` - The [`subprocess.stdout`](https://nodejs.org/api/child_process.html#child_process_subprocess_stdout).
- `stderr` - The [`subprocess.stderr`](https://nodejs.org/api/child_process.html#child_process_subprocess_stderr).
- `url` - The URL to the server.
- `stop()` - A method, which when called, stops the server.

#### options

Type: `object`

##### port

Type: `number`\
Default: `0`

The port on which you want to access the server.

Specify `0` to use a random port.

##### hostname

Type: `string`\
Default: `'127.0.0.1'` *(Usually the same as `localhost`)*

The hostname the server will use.

Use `'0.0.0.0'` if you want it to be accessible from the outside.

##### base

Type: `string`\
Default: `'.'`

The directory the server will serve from.

##### open

Type: `boolean | string`\
Default: `false`

Open the server URL in the browser.

Can be one of the following:
- `true`: Opens the default server URL (`http://${hostname}${port}`).
- A relative URL: Opens that URL in the browser. Useful when testing pages that are not the default.

##### env

Type: `object`\
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

Type: `string`\
Default: `'php'` *(The one in your `$PATH`)*

The path to the PHP binary.

Can be useful if you have multiple versions of PHP installed.

##### ini

Type: `string`\
Default: The built-in `php.ini`

A path to a custom [`php.ini` config file](https://php.net/manual/en/ini.php).

##### directives

Type: `object`\
Default: `{}`

Add custom [INI directives](https://php.net/manual/en/ini.list.php).
