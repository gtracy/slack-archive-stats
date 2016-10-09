var Promise = require('promise');
var _ = require('underscore');
var jsonfile = require('jsonfile')
var travesty = require('travesty');

var users = require('./users');
var channels = require('./channels');
var integrations = require('./integrations');
var Stats = require('./stats');

if( process.argv.length < 3 ) {
	console.log("\nhmm. i need a directory where the archive is stored. i don't see it. for example,");
	console.log("\t> npm start ~/slack-archives");
	console.log("");
	process.exit(0);
} else {

    // get the list of archive files
    var files = travesty(process.argv[2],{ignore:travesty.match('*')});
    var file_list = _.keys(files.struct);

    // extract the directory base so we can more easily locate the meta files
    var user_file = _.find(file_list, function(file) {
    	return file.indexOf('users.json') >= 0;
    });
    var directory = user_file.slice(0,user_file.lastIndexOf('/')+1);
    var channel_file = directory + 'channels.json';
    var integration_file = directory + 'integration_logs.json';

    // now that we have a pile of files, the first thing to do is 
    // find and interrogate the user file since we'll need those 
    // details to make sense of the messages.
    console.log('parsing user file...');
  	users.init(user_file).done(function() {
  		console.log('parsing channel file...');
  		channels.analyze(users,channel_file).done(function() {
	  		console.log('parsing integrations file...');
	  		integrations.analyze(users,channel_file).done(function() {

		    	var stats = new Stats(users);
		    	console.log('parsing the messages...');
		  		parseMessages(stats, function() {
		     		console.log('... done parsing');
				    stats.printResults();
		  		});

		  	});
	  	});
    });

}

function parseMessages(stats, callback) {
	var file_count = file_list.length;
	var msg_count = 0;

    file_list.forEach(function(file) {

    	var file_parts = file.split('/');
    	var filename = file_parts[file_parts.length-1];

		if( filename !== 'integration_logs.json' &&
		    filename !== 'channels.json' &&
		    filename !== 'users.json' ) {

			//jsonfile.readFileSync(file, {}, function(err, obj) {
			jsonfile.readFile(file, {}, function(err, obj) {
			  if( err ) {
			  	console.log('************* FAIL *************');
			  	console.log(file);
			  	console.log('************* FAIL *************');
			  } else {
			  	// every file has an array of message objects.
			  	// loop through those objects and parse them.
			  	msg_count += obj.length;
			  	obj.forEach(function(item) {
			  		stats.parse(users,item);
				});
				if( --file_count === 0 ) {
					console.log('msg count : ' + msg_count);
				    callback();
				}
			  }

			});
		} else {
			if( --file_count === 0 ) {
				console.log('msg count : ' + msg_count);
			    callback();
			}
		}
    });	

}