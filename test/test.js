'use strict';

var assert = require('assert');
var xirr = require('../');

describe('xirr', function() {
    it('computes the xirr on 1 year growth of 0%', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 1000, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(0, result.toPrecision(6));
    });

    it('computes the xirr on 1 year growth of 10%', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 1100, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(.10, result.toPrecision(6));
    });

    it('computes the xirr on 1 year growth of 12% with investments at 3 ' + 
            'month intervals the same as LibreOffice', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: -1000, when: new Date(2010,3,1) });
        transactions.push({ amount: -1000, when: new Date(2010,6,1) });
        transactions.push({ amount: -1000, when: new Date(2010,9,1) });
        transactions.push({ amount: 4300, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(.121268, result.toPrecision(6));
    });

    it('computes the negative xirr on 1 year growth of 10%', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 900, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(-.10, result.toPrecision(6));
    });

});