var Promise = require('promise');
var jsonfile = require('jsonfile')
var hire_dates = require('../hire_dates');
var stats = require('../stats');


// returns a unix timestamp for the start
// of time - the greater of hire data and slack start date
function getCreateDate(name) {

	// if they don't exist, just return today's date
	if( !hire_dates.users[name] ) {
		return new Date().getTime();
	} else {
		// this is a lazy mess. slack uses dates in seconds
		// to compensate for a system that likes miliseconds 
		// for dates, we multiple by 1000
		var hire_date = hire_dates.users[name] * 1000;
		if( hire_date < hire_dates.slack_start ) {
			return hire_dates.slack_start;
		} else {
			return hire_date;
		}
	}
}

module.exports = (function () {

	var users = {};

    return {
	    init : function(file) {
	    	return new Promise(function(fulfill, reject) {
				stats.addStat('total_users');
				jsonfile.readFile(file, function(err, obj) {
				  if( err ) {
				  	console.log('>>> user import error');
				  	reject();
				  } else {
				  	obj.forEach(function(user) {
						if( !user.deleted ) {
							stats.incrementStat('total_users',1);

							users[user.id] = user;
							// combine account creation dates from our own sources.
							var created = getCreateDate(user.name);
							users[user.id].created = created
							var account_days = Math.round(Math.abs(new Date() - new Date(created)) / (1000*60*60*24));
							users[user.id].account_days = account_days;
						}
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

		getAge : function(id) {
			if( users[id] === undefined ) {
				return 0;
			} else {
				return(users[id].account_days);
			}
		},

		getHired : function(id) {
			if( users[id] === undefined ) {
				return 0;
			} else {
				return(users[id].created);
			}
		},

		getAll : function() {
			return users;
		}
    }

}());