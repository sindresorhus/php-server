export interface Options {
	/**
	The port on which you want to access the webserver.

	Specify `0` to use a random port.

	@default 0
	*/
	readonly port?: number;

	/**
	The hostname the server will use.

	Use `'0.0.0.0'` if you want it to be accessible from the outside.

	@default '127.0.0.1'
	*/
	readonly hostname?: string;

	/**
	The directory the server will serve from.

	@default '.'
	*/
	readonly base?: string;

	/**
	Open the server URL in the browser.

	Can be one of the following:
	- `true`: Opens the default server URL (`http://${hostname}${port}`).
	- A relative URL: Opens that URL in the browser. Useful when testing pages that are not the default.

	@default false
	*/
	readonly open?: boolean | string;

	/**
	Set environment variables for the PHP process.
	*/
	readonly env?: Record<string, string>;

	/**
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
	*/
	readonly router?: string;

	/**
	The path to the PHP binary.

	@default 'php'
	*/
	readonly binary?: string;

	/**
	A path to a custom [`php.ini` config file](https://php.net/manual/en/ini.php).

	Default: The built-in `php.ini`
	*/
	readonly ini?: string;

	/**
	Add custom [INI directives](https://php.net/manual/en/ini.list.php).
	*/
	readonly directives?: Record<string, string>;
}

export interface Server {
	/**
	The [`subprocess.stderr`](https://nodejs.org/api/child_process.html#child_process_subprocess_stdout).
	*/
	readonly stdout: NodeJS.WritableStream;

	/**
	The [`subprocess.stderr`](https://nodejs.org/api/child_process.html#child_process_subprocess_stderr).
	*/
	readonly stderr: NodeJS.WritableStream;

	/**
	The URL to the server.
	*/
	readonly url: string;

	/**
	A method, which when called, stops the server.
	*/
	stop(): void;
}

/**
Start a [PHP server](https://php.net/manual/en/features.commandline.webserver.php)

@example
```
import phpServer from 'php-server';

const server = await phpServer();
console.log(`PHP server running at ${server.url}`);
```
*/
export default function phpServer(options?: Options): Promise<Server>;
