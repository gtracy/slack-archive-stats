var Promise = require('promise');
var jsonfile = require('jsonfile')
var stats = require('../stats');


module.exports.analyze = function(users, file_list) {

   	return new Promise(function(fulfill, reject) {
		stats.addStatGroup('message_types');
		stats.addStatGroup('message_subtypes');
		stats.addStatGroup('reaction receiver');
		stats.addStatGroup('reaction giver');
		stats.addStatGroup('popular reactions');

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
				  	var total = 0;
				  	obj.forEach(function(item) {
				    	stats.incrementStat('total messages',1);
					  	switch( item.type ) {
					  		case 'message':
					  		    switch( item.subtype ) {
					  		        case 'bot_message':
					  		    	    break;
					  		    	default:
					  		    		stats.incrementStatGroup('message_types',item.type,1);
					  		    		stats.incrementStatGroup('message_subtypes',item.subtype,1);
					  		    	    if( item.reactions ) {
					  		    	    	reaction_stats(users,item);
						  		    	}
					  		    	    break;
					  		    }
					  		    break;
					  		default:
					  		    console.log('>>> unexpected message type!?!');
					  		    console.dir(item);
					  	}
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

// note that emoji reactions were released on july 9th, 2015
function reaction_stats(users,item) {
	var user_handle = users.getHandle(item.user);
	
	item.reactions.forEach(function(r) {

		// who receives the most reactions?
		stats.incrementStatGroup('reaction receiver',user_handle,r.count);

		// who gives the most reactions?
		r.users.forEach(function(u) {
			var giver_handle = users.getHandle(u);
			stats.incrementStatGroup('reaction giver',giver_handle,1);
		});

		// what are the most popular reactions?
		stats.incrementStatGroup('popular reactions',r.name,r.count);
	});

}

