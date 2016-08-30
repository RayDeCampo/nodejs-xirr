'use strict';

var newton = require('newton-raphson-method');

var MILLIS_PER_DAY = 1000*60*60*24;
var DAYS_IN_YEAR = 365;

function convert(data) {
    var transactions = [];
    var end = Math.floor(data[0].when/MILLIS_PER_DAY);
    var total = 0;
    data.forEach(function(datum) {
        total += datum.amount;
        var epochDays = Math.floor(datum.when/MILLIS_PER_DAY);
        end = Math.max(end, epochDays);
        transactions.push({
            amount: datum.amount,
            epochDays: epochDays
        });
    });
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
            var D = transactions[i].amount;
            var Y = transactions[i].years;
            sum += D * Math.pow(1+rate, Y);
        }
        return sum;
    };
    var derivative = function(rate) {
        var sum = 0;
        for (var i = 0; i < transactions.length; i++) {
            // Make the vars more math-y
            var D = transactions[i].amount;
            var Y = transactions[i].years;
            if (Y !== 0) {
                sum += D * Y * Math.pow(1+rate, Y-1);
            }
        }
        return sum;
    };
    return newton(val, derivative, Math.sign(data.total)/100, options);
}

module.exports = xirr;