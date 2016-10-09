var Promise = require('promise');
var _ = require('underscore');
var jsonfile = require('jsonfile')
var travesty = require('travesty');

var users = require('./users');
var channels = require('./channels');
var integrations = require('./integrations');
var messages = require('./messages');
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
    	var stats = new Stats(users);

  		console.log('parsing channel file...');
  		channels.analyze(users,channel_file).done(function() {
	  		console.log('parsing integrations file...');
	  		integrations.analyze(users,channel_file).done(function() {

		    	process.stdout.write('parsing the messages...');
		    	messages.analyze(users,file_list,stats).done(function() {
		    		console.log('\n\n');
		    		stats.printResults();
		    		console.log('\n\n');
		    	});

		  	});
	  	});
    });

}
