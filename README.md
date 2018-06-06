# promise-transaction
Small library written in Node JS for making multiple of sequential and interdependent promise calls in emulated ACID transaction manner in traditional database system although not exactly same. But still offer all or nothing approch with option for multiple retries in each step of a transaction.

This small library can be useful in your project where you have to make multiple of sequential and interdependent API calls in a single request to processed for a user such as in ecommerce or banking transaction checkout process where all or nothing (aka) ACID property needs to be remained. 

To emulate `rollback` process as in a transaction for traditional RDBMS, you can define a rollback promise to be made if a particular step fails. If no rollback is required for a particular step, you can simply define a function that returns a resolved promise: `() => Promise.resolve()` 


How to use it?
--------------

* Install the package first

`npm install promise-transaction`

* Import it into your code
```javascript

import Transaction from 'promise-transaction';

// example dummy code
const t = new Transaction([
  {
    name: 'seed',
    perform: () => Promise.resolve(3),
    rollback: () => false,
    retries: 1, // optionally you can define how many retries you like to run if initial attemp fails for this step
  },
  {
    name: 'square',
    perform: (context) => {
      return Promise.resolve(context.data.seed * context.data.seed);
    },
    rollback: () => false,
  },
]);

return t.process().then((result) => {
expect(result).to.equal(9);
});

```





