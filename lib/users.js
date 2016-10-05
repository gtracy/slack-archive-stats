var Promise = require('promise');
var jsonfile = require('jsonfile')

module.exports = (function () {

	var users = {};

    return {
	    init : function(file) {
	    	return new Promise(function(fulfill, reject) {
				jsonfile.readFile(file, function(err, obj) {
				  if( err ) {
				  	console.log('************* FAIL *************');
				  	console.log('\t user import error');
				  	console.log('************* FAIL *************');
				  	reject();
				  } else {
				  	console.log('>>>>>>> user file read. now parsing');
				  	obj.forEach(function(user) {
				  		users[user.id] = user;
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