var Promise = require('promise');
var jsonfile = require('jsonfile')
var hire_dates = require('../hire_dates');

// returns a unix timestamp for the start
// of time - the greater of hire data and slack start date
function getCreateDate(name) {
	// if they don't exist, just return today's date
	if( !hire_dates.users[name] ) {
		return new Date().getTime();
	} else {
		var hire = hire_dates.users[name];
		if( hire_dates.users[name] < hire_dates.slack_start ) {
			return hire_dates.slack_start;
		} else {
			return hire_dates.users[name] * 1000;
		}
	}
}

module.exports = (function () {

	var users = {};

    return {
	    init : function(file) {
	    	return new Promise(function(fulfill, reject) {
				jsonfile.readFile(file, function(err, obj) {
				  if( err ) {
				  	console.log('>>> user import error');
				  	reject();
				  } else {
				  	obj.forEach(function(user) {
				  		users[user.id] = user;
				  		// combine account creation dates from our own sources.
			  		    users[user.id].created = getCreateDate(user.name);
					});
					fulfill();
				  }
			    });
			});
		},

		fetch : function(id) {
			return(users[id]);
		},

		getName : function(id) {
			if( users[id] === undefined ) {
				return('unknown');
			} else {
    			return(users[id].real_name);
    		}
		},

		getHandle : function(id) {
			if( users[id] === undefined ) {
				return('unknown');
			} else {
    			return(users[id].name);
    		}
		},

		getAll : function() {
			return users;
		}
    }

}());