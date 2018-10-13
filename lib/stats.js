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
		console.log('Exporting results...');
		_.keys(that.statistics).forEach(function(stat) {
		    var res = fs.createWriteStream('./results/'+stat+'.csv');
		    res.on('finish', function() {
		        //callback();
		    });
		    res.on('open', function(fd) {

		    	// some stats are single counters
		    	if( _.size(that.statistics[stat]) === 0 ) {
		    		res.write(stat + ' :: ' + that.statistics[stat]);
				} else if( stat === 'popular_messages' ) {
			        var headers = 'stat name, count'.split(",");
					res.write(new S(headers).toCSV().s+"\n");
					that.statistics['popular_messages'].forEach(function(msg) {
						var data = [
							msg.item,
							msg.count
						];
						res.write(new S(data).toCSV().s+"\n");
					});
			    } else if( stat === 'reactions_by_user' ) {
					// some stats are collections of stats
			        var headers = 'user id, reaction, count'.split(",");
					res.write(new S(headers).toCSV().s+"\n");
					// the keys for this stat are the list of users
			        _.keys(that.statistics[stat]).forEach(function(user) {
						// sort the user reactions by counts
						if( user === 'shan.sontag' ) {console.dir(that.statistics[stat][user]);}
						//_.sortBy(that.statistics[stat][user], 'count');
						that.statistics[stat][user].sort(function(a,b) {
							return b.count - a.count;
						});
						if( user === 'shan.sontag' ) {console.dir(that.statistics[stat][user]);}

						that.statistics[stat][user].forEach(function(reaction) {
							var data = [
								user,
								reaction.reaction,
								reaction.count
							];
							res.write(new S(data).toCSV().s+"\n");
						});
					});
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

_Stats.prototype.popularMessages = function(msg, reaction_count) {
	if( !this.statistics.hasOwnProperty('popular_messages') ) {
		this.statistics['popular_messages'] = [];
	} else {
			this.statistics['popular_messages'].push({item:msg,count:reaction_count});
			this.statistics['popular_messages'].sort(function(a,b) {
				return (a.count - b.count) * -1;
			});

			if( this.statistics['popular_messages'].length > 10 ) {
				this.statistics['popular_messages'].splice(-1,1);
			}
	}
};

// { emoji : grin, first_date : 2017-02-23 }
_Stats.prototype.addDateCollection = function(stat_group) {
	if( !this.statistics.hasOwnProperty(stat_group) ) {
		this.statistics[stat_group] = {};
	}
};

_Stats.prototype.syncDateCollection = function(stat_group,stat_name,date) {
	if( !this.statistics[stat_group].hasOwnProperty(stat_name) ) {
		this.statistics[stat_group][stat_name] = date;
	} else if( date < this.statistics[stat_group][stat_name] ) {
		this.statistics[stat_group][stat_name] = date;
	}
};

// stat collections are two dimensional object collection counters
//    Example : [user][emoji]
_Stats.prototype.addStatCollection = function(stat_collection_name) {
	if( !this.statistics.hasOwnProperty(stat_collection_name) ) {
		this.statistics[stat_collection_name] = {};
	}
};

_Stats.prototype.incrementStatCollection = function(stat_collection_name,first,second,count) {
	if( !this.statistics.hasOwnProperty(stat_collection_name) ) {
		this.statistics[stat_collection_name] = {};
		this.statistics[stat_collection_name][first] = [{
			'reaction' : second,
			'count' : count
	    }];
	} else if( !this.statistics[stat_collection_name].hasOwnProperty(first) ) {
		this.statistics[stat_collection_name][first] = [{
			'reaction' : second,
			'count' : count
		}];
	} else if( !_.findWhere(this.statistics[stat_collection_name][first],{reaction:second}) ) {
		this.statistics[stat_collection_name][first].push({
			'reaction' : second,
			'count' : count
		});
	} else {
		var stat = _.findWhere(this.statistics[stat_collection_name][first],{reaction:second});
		stat.count += count;
	}
}

module.exports = new _Stats();