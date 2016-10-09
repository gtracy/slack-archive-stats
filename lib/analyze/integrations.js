var Promise = require('promise');
var jsonfile = require('jsonfile')

module.exports.analyze = function(users, filename) {

   	return new Promise(function(fulfill, reject) {

		jsonfile.readFile(filename, function(err, channels) {
		  if( err ) {
		  	console.log('>>> integration import error');
		  	reject();
		  } else {

		  	// intentionally left blank. nothing has been implemented yet.
			fulfill();
			
		  }
	    });
	});
	
}