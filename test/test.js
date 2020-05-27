/* jshint mocha:true */

'use strict';

var assert = require('assert');
var requireSubvert = require('require-subvert')(__dirname);
var sinon = require('sinon');

var xirr = require('../xirr');

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
        assert.equal(0.10, result.toPrecision(6));
    });

    it('computes the xirr on a particular data set ' +
            'the same as a popular spreadsheet', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: -1000, when: new Date(2010,3,1) });
        transactions.push({ amount: -1000, when: new Date(2010,6,1) });
        transactions.push({ amount: -1000, when: new Date(2010,9,1) });
        transactions.push({ amount: 4300, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(0.121268, result.toPrecision(6));
    });

    it('gets the same answer even if the transations are out of order', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,9,1) });
        transactions.push({ amount: 4300, when: new Date(2011,0,1) });
        transactions.push({ amount: -1000, when: new Date(2010,6,1) });
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: -1000, when: new Date(2010,3,1) });
        var result = xirr(transactions);
        assert.equal(0.121268, result.toPrecision(6));
    });

    it('computes the negative xirr on 1 year decline of 10%', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 900, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(-0.10, result.toPrecision(6));
    });

    it('computes rates of return greater than 100%', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 3000, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(2, result.toPrecision(6));
    });

    it('computes a rate of return of -100% on a total loss', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 0, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(-1, result.toPrecision(6));
    });

    it('computes a rate of return of -100% on a total loss', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010, 0, 1) });
        transactions.push({ amount: 0, when: new Date(2012, 0, 1) });
        var result = xirr(transactions);
        assert.equal(-1, result.toPrecision(6));
    });

    it('computes a rate of return of -100% on a total loss', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010, 0, 1) });
        transactions.push({ amount: 0, when: new Date(2010, 7, 1) });
        var result = xirr(transactions);
        assert.equal(-1, result.toPrecision(6));
    });

    it('does not error out on this data set (see issue #1)', function() {
        var transactions = [];
        transactions.push({ amount: -10000, when: new Date('2000-05-24T00:00:00.000Z') });
        transactions.push({ amount: 3027.25, when: new Date('2000-06-05T00:00:00.000Z') });
        transactions.push({ amount: 630.68, when: new Date('2001-04-09T00:00:00.000Z') });
        transactions.push({ amount: 2018.2, when: new Date('2004-02-24T00:00:00.000Z') });
        transactions.push({ amount: 1513.62, when: new Date('2005-03-18T00:00:00.000Z') });
        transactions.push({ amount: 1765.89, when: new Date('2006-02-15T00:00:00.000Z') });
        transactions.push({ amount: 4036.33, when: new Date('2007-01-10T00:00:00.000Z') });
        transactions.push({ amount: 4036.33, when: new Date('2007-11-14T00:00:00.000Z') });
        transactions.push({ amount: 1513.62, when: new Date('2008-12-17T00:00:00.000Z') });
        transactions.push({ amount: 1513.62, when: new Date('2010-01-15T00:00:00.000Z') });
        transactions.push({ amount: 2018.16, when: new Date('2011-01-14T00:00:00.000Z') });
        transactions.push({ amount: 1513.62, when: new Date('2012-02-03T00:00:00.000Z') });
        transactions.push({ amount: 1009.08, when: new Date('2013-01-18T00:00:00.000Z') });
        transactions.push({ amount: 1513.62, when: new Date('2014-01-24T00:00:00.000Z') });
        transactions.push({ amount: 1513.62, when: new Date('2015-01-30T00:00:00.000Z') });
        transactions.push({ amount: 1765.89, when: new Date('2016-01-22T00:00:00.000Z') });
        transactions.push({ amount: 1765.89, when: new Date('2017-01-20T00:00:00.000Z') });
        transactions.push({ amount: 22421.55, when: new Date('2017-06-05T18:30:00.000Z') });

        var result = xirr(transactions);
        assert.equal(0.212686, result.toPrecision(6));
    });

    it('does not error out on this data set (see issue #2)', function() {
        var transactions = [];
        transactions.push({ amount: -2839.2, when: new Date('2018-01-21T16:00:00.000Z') });
        transactions.push({ amount: -207.7, when: new Date('2018-01-24T16:00:00.000Z') });
        transactions.push({ amount: 2526, when: new Date('2018-04-26T16:00:00.000Z') });

        var result = xirr(transactions);
        assert.equal(-0.514174, result.toPrecision(6));
    });

    it('converges for this coronavirus inspired data set (see issue #7):', function() {
        var transactions = [];
        transactions.push({ amount: -713.07, when: new Date(2020, 2, 4) });
        transactions.push({ amount: 555.33, when: new Date(2020, 2, 17) });

        // With the right guess, the computation will converge
        var result = xirr(transactions, { guess: -0.9975 });
        assert.equal(-0.999106, result.toPrecision(6));
    });

    it('succeeds even when the N-R algorithm values go into the range (-∞,-1]', function() {
        var transactions = [];
        transactions.push({ amount: -2610, when: new Date('2001-06-22T16:00:00.000Z') });
        transactions.push({ amount: -2589, when: new Date('2001-07-03T16:00:00.000Z') });
        transactions.push({ amount: -5110, when: new Date('2001-07-05T16:00:00.000Z') });
        transactions.push({ amount: -2550, when: new Date('2001-07-06T16:00:00.000Z') });
        transactions.push({ amount: -5086, when: new Date('2001-07-09T16:00:00.000Z') });
        transactions.push({ amount: -2561, when: new Date('2001-07-10T16:00:00.000Z') });
        transactions.push({ amount: -5040, when: new Date('2001-07-12T16:00:00.000Z') });
        transactions.push({ amount: -2552, when: new Date('2001-07-13T16:00:00.000Z') });
        transactions.push({ amount: -2530, when: new Date('2001-07-16T16:00:00.000Z') });
        transactions.push({ amount: -9840, when: new Date('2001-07-17T16:00:00.000Z') });
        transactions.push({ amount: 38900, when: new Date('2001-07-18T16:00:00.000Z') });

        var result = xirr(transactions);
        assert.equal(-0.835340, result.toPrecision(6));
    });

    it('does not error out on lots of data', function() {
        var transactions = [];
        var cnt = 120;
        for (var i=0; i<cnt; i++) {
            transactions.push({ amount: -1000, when: new Date(2010+(i/12),i%12,1) });
        }
        transactions.push({ amount: cnt*1000*1.5, when: new Date(2020,0,1) });
        var result = xirr(transactions);
        assert.equal(0.0785780, result.toPrecision(6));
    });

    it('takes guess as option', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 1100, when: new Date(2011,0,1) });
        var result = xirr(transactions,  { guess: 0.1 } );
        assert.equal(0.100000, result.toPrecision(6));
    });

    describe('failure modes', function() {
        it('throws an exception when Newton\'s method fails', sinon.test(function() {
            var newtonStub = sinon.stub();
            newtonStub.returns(false);
            requireSubvert.subvert('newton-raphson-method', newtonStub);
            var xirrWithStub = requireSubvert.require('../xirr');
            var transactions = [];
            transactions.push({ amount: -1000, when: new Date(2010,0,1) });
            transactions.push({ amount: 1100, when: new Date(2011,0,1) });
            assert.throws(function() { xirrWithStub(transactions); },
                /Newton-Raphson algorithm failed to converge./);
            requireSubvert.cleanUp();
        }));

        it('throws an exception when there are less than 2 transactions', function() {
            var msg = /Argument is not an array with length of 2 or more./;
            assert.throws(xirr, msg);
            assert.throws(function() { xirr([]); }, msg);
            assert.throws(function() { xirr([{ amount: -1000, when: new Date(2010,0,1) }]); }, msg);
        });

        it('throws an exception when all transactions are on the same day', function() {
            var transactions = [];
            transactions.push({ amount: -1000, when: new Date(2010, 0, 1, 9) });
            transactions.push({ amount: -1000, when: new Date(2010, 0, 1, 13) });
            transactions.push({ amount: 2100, when: new Date(2010, 0, 1, 16) });
            assert.throws(function() { xirr(transactions); },
                /Transactions must not all be on the same day./);
        });

        it('throws an exception when all transactions are negative', function() {
            var transactions = [];
            transactions.push({ amount: -1000, when: new Date(2010, 0, 1) });
            transactions.push({ amount: -1000, when: new Date(2010, 4, 1) });
            transactions.push({ amount: -2000, when: new Date(2010, 8, 1) });
            assert.throws(function() { xirr(transactions); },
                /Transactions must not all be negative./);
        });

        it('throws an exception when all transactions are nonnegative', function() {
            var transactions = [];
            transactions.push({ amount: 1000, when: new Date(2010, 0, 1) });
            transactions.push({ amount: 1000, when: new Date(2010, 4, 1) });
            transactions.push({ amount: 0, when: new Date(2010, 8, 1) });
            assert.throws(function() { xirr(transactions); },
                /Transactions must not all be nonnegative./);
        });

        it('throws an exception when guess is not a number', function() {
            var transactions = [];
            transactions.push({ amount: -1000, when: new Date(2010,0,1) });
            transactions.push({ amount: 1100, when: new Date(2011,0,1) });
            assert.throws(function() { xirr(transactions, { guess: "10%" }); },
                /option.guess must be a number./);
        });
    });
});
