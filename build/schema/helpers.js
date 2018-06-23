const uuid = require('uuid');
const dummyjson = require('dummy-json');
const Handlebars = require('handlebars');

module.exports = {
	hello : ( options ) => {
		const cache = options.data.root.__cache;
		return new Handlebars.SafeString(`Hello '${cache.email_firstName || dummyjson.helpers.firstName(options)}'`);
	},
	uuid : ( item ) => {
		return uuid();
	}
}
