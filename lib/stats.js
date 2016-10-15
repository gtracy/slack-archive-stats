var fs = require('fs');
var _ = require('underscore');
var S = require("string");


function _Stats() {
	var that = this;
	this.users = undefined;
	this.statistics = { };

	this.setUsers = function(users) {
		that.users = users
	};

	function sortValues(statistic,normalize) {
		return _.sortBy(statistic, function(stat) {
			return stat * -1;
		});
	}

	this.printResults = function() {
		_.keys(that.statistics).forEach(function(stat) {
			console.log(stat + " : ");
			console.dir(that.statistics[stat]);
		});
	};

	this.exportResults = function() {
		_.keys(that.statistics).forEach(function(stat) {
		    var res = fs.createWriteStream('./results/'+stat+'.csv');
		    res.on('finish', function() {
		        //callback();
		    });
		    res.on('open', function(fd) {

		    	// some stats are single counters
		    	if( _.size(that.statistics[stat]) === 0 ) {
		    		res.write(stat + ' :: ' + that.statistics[stat]);
			    	console.log(stat + ' :: ' + that.statistics[stat]);
		    	} else {

			        var headers = 'user id, account age, handle, count, normalized count'.split(",");
			        res.write(new S(headers).toCSV().s+"\n");
			        _.keys(that.statistics[stat]).forEach(function(s) {

			    		// emoji reactions were released on july 9th, 2015
			    		// the normalization for these stats should change a little
			    		// rather than using the age of the user account.
			    		var emoji_golive = new Date('2015-06-09').getTime();
			    		var user_age = that.users.getAge(s);
			    		if( stat.indexOf('reaction') >= 0 ) {
			    			// reset the user age
							if( that.users.getHired(s) < emoji_golive ) {
				    			user_age = Math.round(Math.abs(new Date() - new Date(emoji_golive)) / (1000*60*60*24));
				    		}
			    		}

			        	var data = [
			        		s,
			        		that.users.getAge(s),
			        		that.users.getHandle(s),
			        		that.statistics[stat][s],
			        		that.statistics[stat][s] / user_age
			        	];
	                    res.write(new S(data).toCSV().s+"\n");
			        });
			    }
		        //res.end();
		    });
		});
	};

}

_Stats.prototype.getStat = function(stat_name) {
	return this.statistics[stat_name];
}

_Stats.prototype.addStat = function(stat_name, stat) {
	if( this.statistics.hasOwnProperty(stat_name) ) {
		console.log(">>> Fail. We're already tracking stat, " + stat);
	} else {
		this.statistics[stat_name] = stat;
	}
};

_Stats.prototype.incrementStat = function(stat_name,count) {
	if( !this.statistics.hasOwnProperty(stat_name) ) {
		this.statistics[stat_name] = count;
	} else {
		this.statistics[stat_name] += count;
	}
};

_Stats.prototype.addStatGroup = function(stat_name) {
	if( !this.statistics.hasOwnProperty(stat_name) ) {
		this.statistics[stat_name] = {};
	}
};

_Stats.prototype.incrementStatGroup = function(stat_group_name,stat_name,count) {
	if( !this.statistics[stat_group_name].hasOwnProperty(stat_name) ) {
		this.statistics[stat_group_name][stat_name] = count;
	} else {
		this.statistics[stat_group_name][stat_name] += count;
	}
};

module.exports = new _Stats();