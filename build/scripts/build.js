 
const fs = require('fs-extra-promise');
const path = require('path');

const dummyjson = require('dummy-json');
const Handlebars = require('handlebars');


Handlebars.registerHelper('import', function( path ){
	var data = loadSchema( path );
	return JSON.stringify( data );
});


fs.writeJSONAsync( path.resolve( __dirname, '../store/db.json'), loadSchema('index.hbs') );


//HELPER
function loadSchema( pathSchema ){
	return JSON.parse( dummyjson.parse( 
		fs.readFileSync( path.resolve( __dirname, '../schema', pathSchema ), {encoding: 'utf8'} )
	) );
}