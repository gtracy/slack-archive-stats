
function Stats() {
	var that = this;

    this.total_messages = 0;
	this.message_types = {};
	this.message_subtypes = {};

	function incr_msg_type(item) {
		if( this.message_types[item.type] ) {
			this.message_types[item.type]++;
		} else {
			this.message_types[item.type] = 0;
		}
	}

	function incr_msg_subtype(item) {
		if( this.message_subtypes[item.subtype] ) {
			this.message_subtypes[item.subtype]++;
		} else {
			this.message_subtypes[item.subtype] = 0;
		}
	}

	this.printResults = function() {
		console.dir(this.total_messages);
		console.dir(this.message_types);
		console.dir(this.message_subtypes);
	};

    this.parse = function(users,item) {
    	that.total_messages++;
	  	switch( item.type ) {
	  		case 'message':
	  		    switch( item.subtype ) {
	  		        case 'bot_message':
	  		    	    break;
	  		    	default:
					    if( item.subtype ) {
					    	var handle;
					    	if( item.subtype === 'file_comment' ) {
					    		// shitty data in there that is missing file details
					    		// skip it.
					    		if( !item.file ) {
					    			return;
					    		}
					    		handle = users.getHandle(item.file.user);
					    	} else {
					    		handle = users.getHandle(item.user);
					    	}
					    	//console.log(handle+"("+item.user+")"
					    	//	+ " :: " + item.subtype);
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