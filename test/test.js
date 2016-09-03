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

    it('computes the negative xirr on 1 year decline of 10%', function() {
        var transactions = [];
        transactions.push({ amount: -1000, when: new Date(2010,0,1) });
        transactions.push({ amount: 900, when: new Date(2011,0,1) });
        var result = xirr(transactions);
        assert.equal(-0.10, result.toPrecision(6));
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
        it('throws an exception when all transactions are the same sign', function() {
            var transactions = [];
            transactions.push({ amount: -1000, when: new Date(2010, 0, 1) });
            transactions.push({ amount: -1000, when: new Date(2010, 4, 1) });
            transactions.push({ amount: -2000, when: new Date(2010, 8, 1) });
            assert.throws(function() { xirr(transactions); },
                /Transactions must not all be the same sign./);
        });
    });
});
