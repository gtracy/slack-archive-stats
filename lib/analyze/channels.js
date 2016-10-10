var Promise = require('promise');
var jsonfile = require('jsonfile')
var stats = require('../stats');


var creators = {};
var participants = {};


module.exports.analyze = function(users, filename) {

   	return new Promise(function(fulfill, reject) {

   		stats.addStatGroup('popular_channels');
   		stats.addStatGroup('biggest_readers');
   		stats.addStatGroup('channel_creators');

		jsonfile.readFile(filename, function(err, channels) {
		  if( err ) {
		  	console.log('>>> channel import error');
		  	reject();
		  } else {
		  	channels.forEach(function(c) {

		  		// keep track of total, active and archived channels
		  		stats.incrementStat('total_channels',1);
		  		if( c.is_archived ) {
		  			stats.incrementStat('archived_channels',1);
		  		} else {
		  			stats.incrementStat('active_channels',1);
		  		}

		  		// keep track of popularity and membership
		  		stats.incrementStatGroup('popular_channels',c.name,c.members.length);
		  		c.members.forEach(function(user) {
		  			stats.incrementStatGroup('biggest_readers',users.getHandle(user),1);
		  		});

		  		// keep track of creators
		  		stats.incrementStatGroup('channel_creators',users.getHandle(c.creator),1);

			});
			fulfill();
		  }
	    });
	});
	
}