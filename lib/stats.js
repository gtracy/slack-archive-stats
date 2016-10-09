
function Stats(users) {
	var that = this;
	this.users = users;

    this.total_messages = 0;
	this.message_types = {};
	this.message_subtypes = {};
	this.emoji_reactions = {};
	this.reaction_receiver = {};
	this.reaction_giver = {};

	this.printResults = function() {
		console.log('Total Messages : ' + that.total_messages);
		//console.log('>>> reaction receiver');
		//console.dir(this.reaction_receiver);
		//console.log('>>> reaction giver');
		//console.dir(this.reaction_giver);
	};

	function incr_msg_type(item) {
		if( that.message_types.hasOwnProperty(item.type) ) {
			that.message_types[item.type]++;
		} else {
			that.message_types[item.type] = 1;
		}
		if( that.message_subtypes.hasOwnProperty(item.subtype) ) {
			that.message_subtypes[item.subtype]++;
		} else {
			that.message_subtypes[item.subtype] = 1;
		}
	}

    // note that emoji reactions were released on july 9th, 2015
	function reaction_stats(item) {
		var user_handle = that.users.getHandle(item.user);
		
		item.reactions.forEach(function(r) {

			// who receives the most reactions?
			if( that.reaction_receiver.hasOwnProperty(user_handle) ) {
				that.reaction_receiver[user_handle] += r.count;
			} else {
				that.reaction_receiver[user_handle] = 1;
			}

			// who gives the most reactions?
			r.users.forEach(function(u) {
				var giver_handle = that.users.getHandle(u);
				if( that.reaction_giver.hasOwnProperty(giver_handle) ) {
					that.reaction_giver[giver_handle]++;
				} else {
					that.reaction_giver[giver_handle] = 1;
				}
			});

			// what are the most popular reactions?
			if( that.emoji_reactions.hasOwnProperty(r.name) ) {
				that.emoji_reactions[r.name] += r.count;
			} else {
				that.emoji_reactions[r.name] = 1;
			}
		});
	}

    this.parseMessage = function(users,item) {
    	that.total_messages++;
	  	switch( item.type ) {
	  		case 'message':
	  		    switch( item.subtype ) {
	  		        case 'bot_message':
	  		    	    break;
	  		    	default:
	  		    	    incr_msg_type(item);
	  		    	    if( item.reactions ) {
	  		    	    	reaction_stats(item);
		  		    	}
	  		    	    break;
	  		    }
	  		    break;
	  		default:
	  		    console.dir(item);
	  	}
	};
}
module.exports = Stats;