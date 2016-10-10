var _ = require('underscore');
var Promise = require('promise');
var jsonfile = require('jsonfile')
var stats = require('../stats');


module.exports.analyze = function(users, file_list) {

	var computeTotals = function() {
		stats.incrementStat('total_unique_emojis',_.size(stats.getStat('popular_reactions')));
	}

   	return new Promise(function(fulfill, reject) {
		stats.addStatGroup('message_types');
		stats.addStatGroup('message_subtypes');
		stats.addStatGroup('biggest_poster');
		stats.addStatGroup('reaction_receiver');
		stats.addStatGroup('reaction_giver');
		stats.addStatGroup('popular_reactions');
		stats.addStatGroup('channel_joins');
		stats.addStatGroup('channel_leaves');
		stats.addStatGroup('link_adds');
		stats.addStatGroup('thank_you_received');
		stats.addStatGroup('youtuber');
		stats.addStatGroup('image_poster');
		stats.addStatGroup('laugh_machine');
		stats.addStatGroup('golden_sensor_received');
		stats.addStatGroup('mentions');
		stats.addStatGroup('editors');
		stats.addStatGroup('late_night_posters');
		stats.addStatGroup('sick_users');

		var file_count = file_list.length;
	    file_list.forEach(function(file,index) {

	    	// skip the meta files
	    	var file_parts = file.split('/');
	    	var filename = file_parts[file_parts.length-1];
			if( filename !== 'integration_logs.json' &&
			    filename !== 'channels.json' &&
			    filename !== 'users.json' ) {

				// read the underlying message file and parse them
				jsonfile.readFile(file, {}, function(err, obj) {
				  if( err ) {
				  	console.log('>>> Failed to parse message file, ' + file);
					if( --file_count === 0 ) {
						computeTotals();
						fulfill();
					}
				  } else {
				  	// every file has an array of message objects.
				  	// loop through those objects and parse them.
				  	var total = 0;
				  	obj.forEach(function(item) {
				    	stats.incrementStat('total_messages',1);

				    	var handle = users.getHandle(item.user);
					  	switch( item.type ) {
					  		case 'message':
					  			stats.incrementStatGroup('biggest_poster',item.user,1);
					  		    switch( item.subtype ) {
					  		        case 'bot_message':
					  		    	    break;
					  		    	case 'channel_join':
					  		    		stats.incrementStatGroup('channel_joins',item.user,1);
					  		    		break;
					  		    	case 'channel_leave':
					  		    		stats.incrementStatGroup('channel_leaves',item.user,1);
					  		    		break;
					  		    	default:
					  		    		stats.incrementStatGroup('message_types',item.type,1);
					  		    		stats.incrementStatGroup('message_subtypes',item.subtype,1);
					  		    	    if( item.reactions ) {
					  		    	    	reaction_stats(users,item);
						  		    	}

						  		    	// track links shared
						  		    	if( item.hasOwnProperty('attachments') ) {
						  		    		item.attachments.forEach(function(attach) {
						  		    			if( attach.hasOwnProperty('from_url') ) {
								  		    		stats.incrementStatGroup('link_adds',item.user,1);
							  		    			if( attach.from_url.indexOf('youtube') >= 0 ) {
							  		    				stats.incrementStatGroup('youtuber',item.user,1)
							  		    			}
						  		    			}
						  		    		});
						  		    	}

						  		    	// track photos shared
						  		    	if( item.hasOwnProperty('file') && item.file ) {
						  		    		if( item.file.hasOwnProperty('thumb_64') ) {
						  		    			stats.incrementStatGroup('image_poster',item.user,1);
						  		    		}
						  		    	}

						  		    	// track users that are mentioned
						  		    	// example : <@U02AU8F33>
										var regexp = /\<\@(\w{9})\>/g;
										var match, matches = [];
										while ((match = regexp.exec(item.text)) != null) {
											stats.incrementStatGroup('mentions',match[1],1);
										}

										// track the biggest editors
										if( item.hasOwnProperty('edited') ) {
											stats.incrementStatGroup('editors',item.user,1);
										}

										// track late-night posters
										// this implementation could be a lot better by leveraging the 
										// timezones on the user accounts to make this test more relative
										// to the location of the user.
										var tod = new Date(parseInt(item.ts.split('.')[0],10));
										var message_hour = tod.getHours();
										if( message_hour >= 21 || message_hour <= 4 ) {
											stats.incrementStatGroup('late_night_posters',item.user,1);
										}

										// track users that talk about being sick
										if( item.text.toLowerCase().indexOf('sick') >= 0 ) {
											stats.incrementStatGroup('sick_users',item.user,1);
										}

					  		    	    break;
					  		    }
					  		    break;
					  		default:
					  		    console.log('>>> unexpected message type!?!');
					  		    console.dir(item);
					  		    break;
					  	}
					});
					if( --file_count === 0 ) {
						computeTotals();
						fulfill();
					}
				  }

				});
			} else {
				if( --file_count === 0 ) {
					computeTotals();
					fulfill();
				}
			}
	    });	

	});
	
}

// note that emoji reactions were released on july 9th, 2015
function reaction_stats(users,item) {
	var user_handle = users.getHandle(item.user);
	
	item.reactions.forEach(function(r) {

		// who receives the most reactions?
		stats.incrementStatGroup('reaction_receiver',item.user,r.count);

		// who gives the most reactions?
		r.users.forEach(function(u) {
			var giver_handle = users.getHandle(u);
			stats.incrementStatGroup('reaction_giver',u,1);
		});

		// what are the most popular reactions?
		stats.incrementStatGroup('popular_reactions',r.name,r.count);

		// who receives the most thank-yous?
		if( r.name === 'pineapple' ) {
			stats.incrementStatGroup('thank_you_received',item.user,r.count);
		}

		// who receives the most laughs?
		var laugh_emojis = ['simple_smile','smiley','joy','grinning','joy_cat','laughing','smiling_imp','smirk','smirk_cat','smile_cat',];
		if( _.contains(laugh_emojis,r.name) ) {
			stats.incrementStatGroup('laugh_machine',item.user,1);
		}

		// who received the most golden sensors?
		if( r.name === 'golden_sensor' ) {
			stats.incrementStatGroup('golden_sensor_received',item.user,1);
		}

	});

}

