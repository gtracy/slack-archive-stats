var Promise = require('promise');
var _ = require('underscore');
var jsonfile = require('jsonfile')
var travesty = require('travesty');

var users = require('./users');
var Stats = require('./stats');

if( process.argv.length < 3 ) {
	console.log("\nhmm. i need a directory where the archive is stored. i don't see it. for example,");
	console.log("\t> npm start ~/slack-archives");
	console.log("");
	process.exit(0);
} else {
	var stats = new Stats();

    files = travesty(process.argv[2],{ignore:travesty.match('*')});
    var file_list = _.keys(files.struct);

    // now that we have a pile of files, the first thing to do is 
    // find and interrogate the user file since we'll need those 
    // details to make sense of the messages.
    var user_file = _.find(file_list, function(file) {
    	return file.indexOf('users.json') >= 0;
    });
    console.log('parse user file...');
  	users.init(user_file).done(function() {
  		parseMessages(function() {
     		console.log('... done');
		    stats.printResults();
  		});
    });

}

function parseMessages(callback) {
	var file_count = file_list.length;

    file_list.forEach(function(file) {

    	var file_parts = file.split('/');
    	var filename = file_parts[file_parts.length-1];

		if( filename !== 'integration_logs.json' &&
		    filename !== 'channels.json' &&
		    filename !== 'users.json' ) {

			jsonfile.readFile(file, function(err, obj) {
			  if( err ) {
			  	console.log('************* FAIL *************');
			  	console.log(file);
			  	console.log('************* FAIL *************');
			  } else {
			  	obj.forEach(function(item) {
			  		stats.parse(users,item);
				});
				if( --file_count === 0 ) {
				    callback();
				}
			  }

			});
		}
    });	

}