const fs = require('fs-extra-promise');
const path = require('path');
const util = require('util');
const Promise = require('bluebird');
const exec = require('child_process').exec;

const PATH_MOCK_API = path.resolve( '../../../mockapi');

const PATH_MOCK_API_SCHEMA = path.resolve( PATH_MOCK_API, './schema' );
const PATH_MOCK_API_SCRIPTS = path.resolve( PATH_MOCK_API, './scripts' );
const PATH_MOCK_API_STORE = path.resolve( PATH_MOCK_API, './store' );
const PATH_MOCK_API_STORE_DB = path.resolve( PATH_MOCK_API_STORE, './db.json' );
const PATH_MOCK_API_ROUTES = path.resolve( PATH_MOCK_API, './routes.json' );

const PATH_BUILD = path.resolve( __dirname, '../../build' );

const PATH_PACKAGE = path.resolve( './package.json');
const SCRIPTS = {
	"api:run": "json-server --watch ./mockapi/store/db.json --port 4000",
	"api:run:hotload": "concurrently --kill-others \"npm run api:run\" \"npm run api:build:hotload\"",
	"api:build": "node ./mockapi/scripts/build.js",
	"api:build:hotload": "nodemon ./mockapi/scripts/build.js"
}

Promise.mapSeries([
	() => ensureDirExists( PATH_MOCK_API ),
	() => ensureDirExists( PATH_MOCK_API_SCHEMA, ( dir ) => fs.copyAsync( path.resolve( PATH_BUILD, 'schema'), dir )  ),
	() => ensureDirExists( PATH_MOCK_API_SCRIPTS, ( dir ) => fs.copyAsync( path.resolve( PATH_BUILD, 'scripts'), dir )  ),
	() => ensureFileExists( PATH_MOCK_API_ROUTES, ( file ) => fs.copyAsync( path.resolve( PATH_BUILD, 'routes.json'), file ) ),
	() => ensureDirExists( PATH_MOCK_API_STORE ),
	() => addPackageScripts(),
	() => ensureFileExists( PATH_MOCK_API_STORE_DB, () => execPromise( exec( 'npm run api:build', { cwd: path.resolve('.') } ) ) )
], handler => handler() )
.then( result => {
	//all files are in place
	console.log(``);
	console.log(`mockapi installation completed...`);
	console.log(`${PATH_MOCK_API}`);
	console.log(``);
	console.log(`run any of the following commands`);
	Object.keys( SCRIPTS ).forEach( key => {
		console.log(`\tnpm run ${key}`);	
	} );
	console.log(``);
})

//HELPER FUNCTIONS
function addPackageScripts(){
	//read the current script
	return fs.readJSONAsync( PATH_PACKAGE )
	.then( package => {
		//add the scripts
		Object.keys( SCRIPTS ).forEach( key => {
			package.scripts[key] = SCRIPTS[key];	
		} );
		
		//save the result
		return fs.writeJSONAsync( PATH_PACKAGE, package );
	} );
}

function ensureDirExists( dir, handler ){
	//provide default functionality if the directory doesn't exist
	handler = util.isFunction( handler ) ? handler : ( dir ) => fs.mkdirsAsync( dir );
	ensureExists( dir, handler );
}

function ensureFileExists( dir, handler ){
	//provide default functionality if the directory doesn't exist
	if( !util.isFunction( handler ) ){
		throw new Error('Handler required');
	}
	//ensure it exists
	ensureExists( dir, handler );
}

function ensureExists( path, handler ){
	//check for the existence
	return fs.existsAsync( path )
	.then( exists => {
		//implement the handler if required
		return exists ? path : handler( path ).then( result => path );
	});
}

function execPromise( child ) {
	return new Promise(function (resolve, reject) {
		child.addListener("error", reject);
		child.addListener("exit", resolve);
	});
}