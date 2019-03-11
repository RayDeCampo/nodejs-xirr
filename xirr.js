'use strict';

var newton = require('newton-raphson-method');

var MILLIS_PER_DAY = 1000*60*60*24;
var DAYS_IN_YEAR = 365;

function convert(data) {
    if (!data || !data.length || !data.forEach || data.length < 2) {
        throw new Error('Argument is not an array with length of 2 or more.');
    }

    var investments = [];
    var start = Math.floor(data[0].when/MILLIS_PER_DAY);
    var end = start;
    var negative = false;
    var nonnegative = false;
    var total = 0;
    var deposits = 0;
    data.forEach(function(datum) {
        total += datum.amount;
        if (datum.amount < 0) {
            deposits += -datum.amount;
        }
        var epochDays = Math.floor(datum.when/MILLIS_PER_DAY);
        start = Math.min(start, epochDays);
        end = Math.max(end, epochDays);
        negative = negative || datum.amount < 0;
        nonnegative = nonnegative || datum.amount >= 0;
        investments.push({
            amount: datum.amount,
            epochDays: epochDays
        });
    });
    if (start === end) {
        throw new Error('Transactions must not all be on the same day.');
    }
    if (!negative) {
        throw new Error('Transactions must not all be nonnegative.');
    }
    if (!nonnegative) {
        throw new Error('Transactions must not all be negative.');
    }
    investments.forEach(function(investment) {
        // Number of years (including fraction) this item applies
        investment.years = (end - investment.epochDays) / DAYS_IN_YEAR;
    });
    return {
        total: total,
        deposits: deposits,
        days: end - start,
        investments: investments
    };
}

function xirr(transactions, options) {
    var data = convert(transactions);
    var investments = data.investments;
    // IRR calculation works w/ present or future value, future used to avoid division
    var futureValue = function(rate) {
        return investments.reduce(function(sum, investment) {
            // Make the vars more Math-y, makes the derivative easier to see
            var A = investment.amount;
            var Y = investment.years;
            return sum + A * Math.pow(1+rate, Y);
        }, 0);
    };
    var derivative = function(rate) {
        return investments.reduce(function(sum, investment) {
            // Make the vars more Math-y, makes the derivative easier to see
            var A = investment.amount;
            var Y = investment.years;
            if (Y !== 0) {
                return sum + A * Y * Math.pow(1+rate, Y-1);
            } else {
                return sum;
            }
        }, 0);
    };
    var guess = (data.total / data.deposits) / (data.days/DAYS_IN_YEAR);
    var rate = newton(futureValue, derivative, guess, options);
    if (rate === false) {  // truthiness strikes again, !rate is true when rate is zero
        throw new Error("Newton-Raphson algorithm failed to converge.");
    }
    return rate;
}

module.exports = xirr;
