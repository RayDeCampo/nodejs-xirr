'use strict';

var newton = require('newton-raphson-method');

var MILLIS_PER_DAY = 1000*60*60*24;
var DAYS_IN_YEAR = 365;

function convert(data) {
    if (!data || !data.length || !data.forEach || data.length < 2) {
        throw new Error('Argument is not an array with length of 2 or more.');
    }

    var transactions = [];
    var start = Math.floor(data[0].when/MILLIS_PER_DAY);
    var end = start;
    var positive = false;
    var negative = false;
    var total = 0;
    data.forEach(function(datum) {
        total += datum.amount;
        var epochDays = Math.floor(datum.when/MILLIS_PER_DAY);
        start = Math.min(start, epochDays);
        end = Math.max(end, epochDays);
        if (datum.amount < 0) {
            negative = true;
        } else if (datum.amount > 0) {
            positive = true;
        }
        transactions.push({
            amount: datum.amount,
            epochDays: epochDays
        });
    });
    if (start === end) {
        throw new Error('Transactions must not all be on the same day.');
    }
    if (!negative || !positive) {
        throw new Error('Transactions must not all be the same sign.');
    }
    transactions.forEach(function(datum) {
        // Number of years (including fraction) this item applies
        datum.years = (end - datum.epochDays) / DAYS_IN_YEAR;
    });
    return {
        total: total,
        transactions: transactions
    };
}

function xirr(transactions, options) {
    var data = convert(transactions);
    transactions = data.transactions;
    var val = function(rate) {
        var sum = 0;
        for (var i = 0; i < transactions.length; i++) {
            // Make the vars more math-y
            var A = transactions[i].amount;
            var Y = transactions[i].years;
            sum += A * Math.pow(1+rate, Y);
        }
        return sum;
    };
    var derivative = function(rate) {
        var sum = 0;
        for (var i = 0; i < transactions.length; i++) {
            // Make the vars more math-y
            var A = transactions[i].amount;
            var Y = transactions[i].years;
            if (Y !== 0) {
                sum += A * Y * Math.pow(1+rate, Y-1);
            }
        }
        return sum;
    };
    var rate = newton(val, derivative, Math.sign(data.total)/100, options);
    if (rate === false) {  // truthiness strikes again, !rate is true when rate is zero
        throw new Error("Newton-Raphson algorithm failed to converge.");
    }
    return rate;
}

module.exports = xirr;
