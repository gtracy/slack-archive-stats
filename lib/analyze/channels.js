var Promise = require('promise');
var jsonfile = require('jsonfile')
var stats = require('../stats');


var creators = {};
var participants = {};


module.exports.analyze = function(users, filename) {

   	return new Promise(function(fulfill, reject) {

   		stats.addStatGroup('popular channels');
   		stats.addStatGroup('biggest readers');

		jsonfile.readFile(filename, function(err, channels) {
		  if( err ) {
		  	console.log('>>> channel import error');
		  	reject();
		  } else {
		  	channels.forEach(function(c) {

		  		// keep track of total, active and archived channels
		  		stats.incrementStat('total channels',1);
		  		if( c.is_archived ) {
		  			stats.incrementStat('archived channels',1);
		  		} else {
		  			stats.incrementStat('active channels',1);
		  		}

		  		// keep track of popularity and membership
		  		stats.incrementStatGroup('popular channels',c.name,c.members.length);
		  		c.members.forEach(function(user) {
		  			stats.incrementStatGroup('biggest readers',users.getHandle(user),1);
		  		});

		  		// keep track of creators
		  		stats.incrementStat('channel creators',1);

			});
			fulfill();
		  }
	    });
	});
	
}