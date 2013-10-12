/**
 * @module Skritter
 * @author Joshua McFarland
 */
define(function() {
    /**
     * @class Scheduler
     * @constructor
     */
    function Scheduler() {}
    
    /**
     * @method getNewInterval
     * @param {StudyItem} item
     * @param {Number} grade
     * @returns {Number}
     */
    Scheduler.prototype.getNewInterval = function(item, grade) {
	function getInitialInterval(item, score, config) {
	    var interval;
	    var initialRight = config.get('initialRightInterval');
	    var initialWrong = config.get('initialWrongInterval');

	    if (!item.has('last')) {
		switch (score)
		{
		    case 1:
			interval = initialWrong;
			break;
		    case 2:
			interval = initialRight / 5;
			break;
		    case 3:
			interval = initialRight;
			break;
		    case 4:
			interval = initialRight * 4;
			break;
		}
		return interval;
	    }

	    switch (score)
	    {
		case 2:
		    interval = 0.9;
		    break;
		case 4:
		    interval = 3.5;
		    break;
	    }

	    return interval;
	}
	
	function getFactor(item, score, config) {
	    var factorsList = (score === 1) ? config.get('wrongFactors') : config.get('rightFactors');
	    var divisions = [2, 1200, 18000, 691200];
	    var index;
	    for (var i in divisions)
	    {
		if (item.get('interval') > divisions[i]) {
		    index = i;
		}
	    }
	    return factorsList[index];
	}
	
	function getBoundInterval(interval, score) {
	    if (score === 1) {
		if (interval > 604800) {
		    interval = 604800;
		} else if (interval < 30) {
		    interval = 30;
		}
	    } else {
		if (interval > 315569260) {
		    interval = 315569260;
		} else if (score === 2 && interval < 300) {
		    interval = 300;
		} else if (interval < 30) {
		    interval = 30;
		}
	    }
	    return interval;
	}
	
	function getRandomizedInterval(interval) {
	    return Math.round(interval * (0.925 + (Math.random() * 0.15)));
	}
	
	var config = this.config = Skritter.study.srsconfigs.findWhere({part: item.get('part')});
	var score = parseInt(grade, 10);
	var reviews = item.get('reviews');
	var successes = item.get('successes');
	var interval = getInitialInterval(item, score, config);
	var current_time = Skritter.fn.getUnixTime();
        var new_interval;

	if (!item.has('last')) {
	    new_interval = getBoundInterval(getRandomizedInterval(interval));
	    //console.log('New Item Interval:', new_interval);
	    return new_interval;
	}

	var actual_interval = current_time - item.get('last');
	var scheduled_interval = item.get('next') - item.get('last');
	var ratio = actual_interval / scheduled_interval;
	var factor = getFactor(item, score, config);
	//console.log('Actual:', actual_interval);
	//console.log('Scheduled:', scheduled_interval);
	//console.log('Ratio:',  ratio);
	//console.log('Factor:', factor);
	//adjust the factor
	if (score > 2) {
	    factor -= 1;
	    factor *= ratio;
	    factor += 1;
	}

	//accelerate new known items
	if (successes === reviews && reviews < 5) {
	    factor *= 1.5;
	}

	//decelerate hard items
	if (reviews > 8) {
	    var pct_right = successes / reviews;
	    if (pct_right < 0.5)
		factor *= Math.pow(pct_right, 0.7);
	}

	//calculate, randomize and bound new interval
	new_interval = getBoundInterval(getRandomizedInterval(actual_interval * factor));
	//console.log('New Interval:', new_interval);
	return new_interval;
    };
    

    return Scheduler;
});