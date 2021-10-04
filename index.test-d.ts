import {expectType} from 'tsd';
import phpServer, {Server} from './index.js';

expectType<Promise<Server>>(phpServer());

expectType<Promise<Server>>(phpServer({
	port: 8000,
	hostname: '0.0.0.0',
	base: 'foo',
	open: true,
	env: {
		FOOBAR: 'foobar', // eslint-disable-line @typescript-eslint/naming-convention
	},
	router: 'index.php',
	binary: 'php5',
	ini: 'php.ini',
	directives: {
		error_log: 'foobar', // eslint-disable-line @typescript-eslint/naming-convention
	},
}));
