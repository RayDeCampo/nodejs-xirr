# Internal Rate of Return

The internal rate of return of an investment made at irregular intervals is the constant rate of return which would yield the equivalent value.

For example, suppose you purchased $1000 in a stock on January 15, then $2500 on February 8 and finally another $1000 on April 17.  The value of the stock on August 24 is $5050.  The internal rate of return could be computed by:

```` javascript
var xirr = require('xirr');
var rate = xirr([
   {amount: -1000, when: new Date(2016, 0, 15)},
   {amount: -2500, when: new Date(2016, 1, 8)},
   {amount: -1000, when: new Date(2016, 3, 17)},
   {amount: 5050, when: new Date(2016, 7, 24)},
]);
console.log(rate);  // Prints 0.2504234710540838
````

This means annualized rate of return is 25.04%.  That is, an equivalent investment would be a savings account of with an interest rate of 25.04%.  (And if you happen to know of such a savings account, please let the author know immediately.)

This calculation can be used to compare disparate investments.

## It doesn't converge?!

If your calculation doesn't converge, try defining different values for the `guess` property in the `options` argument.  This is particularly likely to happen when the solution is near -1.

Pull requests with superior methods for determining the starting point for Newton's method are welcome.

## API

#### require('xirr')(transactions [, options])

Given a sequence of transactions, computes the internal rate of return.

**Parameters**:
- `transations`: an array of objects with the following properties:
  - `amount`: the amount of the transaction
  - `when`: the Date when the transaction occurred
- `options`: Options to pass directly to the underlying Newton's method implementation, [`newton-raphson-method`](https://github.com/scijs/newton-raphson-method).  In addition, if the `guess` property is defined, it will be used as the initial guess for the algorithm.

**Returns**: the annualized internal rate of return as a decimal in [-1,∞)

**Throws**:
- Error:
  - when the `amount`s of the transactions are all the same sign
  - when there are fewer than two transactions
  - when the transactions all occur on the same day (time is ignored)
  - when the [`newton-raphson-method`](https://github.com/scijs/newton-raphson-method) fails to converge

## Implementation Details

To compute the irregular rate of return, you must find the constant rate of return which yields a present value of zero over the set of transactions.  The present value of a transaction is determined by the formula <code>A(1+r)<sup>Y</sup></code>, where `A` is the `amount`, `Y` is the duration of the investment represented by the transaction in years and  `r` is the rate to solve for.  The sum of the present values is the function for which we need to find the zero.

To find the zero of a function, we use Newton's method as implemented by the [`newton-raphson-method`](https://github.com/scijs/newton-raphson-method) module.  To use Newton's method, we need the derivative of the present value with respect to `r`. Fortunately this is easily determined using the power rule.  The derivative is the sum of the terms <code>AY(1+r)<sup>Y-1</sup></code> for which `Y` is not zero.

I had a very elegant proof of the above but unfortunately the margin is too small to contain it.
