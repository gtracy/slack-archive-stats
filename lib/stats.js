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
		        var headers = 'user id, account age, handle, count'.split(",");
		        res.write(new S(headers).toCSV().s+"\n");
		        _.keys(that.statistics[stat]).forEach(function(s) {
		        	var data = [
		        		s,
		        		that.users.getAge(s),
		        		that.users.getHandle(s),
		        		that.statistics[stat][s]
		        	];
                    res.write(new S(data).toCSV().s+"\n");
		        })
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