var Promise = require('promise');
var jsonfile = require('jsonfile')

var total_channels = 0;
var total_active = 0;
var total_archived = 0;
var creators = {};
var participants = {};
var popularity = {};


module.exports.analyze = function(users, filename) {

   	return new Promise(function(fulfill, reject) {

		jsonfile.readFile(filename, function(err, channels) {
		  if( err ) {
		  	console.log('>>> channel import error');
		  	reject();
		  } else {
		  	channels.forEach(function(c) {

		  		// keep track of total, active and archived channels
		  		total_channels++;
		  		if( c.is_archived ) {
		  			total_archived++;
		  		} else {
		  			total_active++;
		  		}

		  		// keep track of popularity and membership
		  		popularity[c.name] = c.members.length;
		  		c.members.forEach(function(user) {
		  			if( participants.hasOwnProperty(user) ) {
		  				participants[user]++;
		  			} else {
		  				participants[user] = 1;
		  			}
		  		});

		  		// keep track of creators
		  		if( creators.hasOwnProperty(c.creator) ) {
		  			creators[c.creator]++;
		  		} else {
		  			creators[c.creator] = 1;
		  		}

			});
			fulfill();
		  }
	    });
	});
	
}