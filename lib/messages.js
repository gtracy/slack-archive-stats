var Promise = require('promise');
var jsonfile = require('jsonfile')

module.exports.analyze = function(users, file_list, stats) {

   	return new Promise(function(fulfill, reject) {

		var file_count = file_list.length;
	    file_list.forEach(function(file,index) {
	    	if( file_count % index === 5 ) process.stdout.write('.');

	    	// skip the meta files
	    	var file_parts = file.split('/');
	    	var filename = file_parts[file_parts.length-1];
			if( filename !== 'integration_logs.json' &&
			    filename !== 'channels.json' &&
			    filename !== 'users.json' ) {

				// read the underlying message file and parse them
				jsonfile.readFile(file, {}, function(err, obj) {
				  if( err ) {
				  	console.log(file);
				  } else {
				  	// every file has an array of message objects.
				  	// loop through those objects and parse them.
				  	obj.forEach(function(item) {
				  		stats.parseMessage(users,item);
					});
					if( --file_count === 0 ) fulfill();
				  }

				});
			} else {
				if( --file_count === 0 ) fulfill();
			}
	    });	

	});
	
}