import {expectType} from 'tsd';
import phpServer = require('.');

expectType<phpServer.Server>(phpServer());

expectType<phpServer.Server>(phpServer({
	port: 8000,
	hostname: '0.0.0.0',
	base: 'foo',
	open: true,
	env: {
		FOOBAR: 'foobar'
	},
	router: 'index.php',
	binary: 'php5',
	ini: 'php.ini',
	directives: {
		error_log: 'foobar' // eslint-disable-line camelcase
	},
}));
