# promise-transaction
Small library written in Node JS for making multiple of sequential and interdependent promise calls in emulated ACID transaction manner in traditional database system although not exactly same. But still offer all or nothing approch with option for multiple retries in each step of a transaction.

This small library can be useful in your project where you have to make multiple of sequential and interdependent API calls in a single request to processed for a user such as in ecommerce or banking transaction checkout process where all or nothing (aka) ACID property needs to be remained. 

Conceptually, a transaction is composed of a sequence of tasks/steps to be performed sequentially. Each task contains three information: 
  * name - name of the task or step in string value, should
  * perform - a callback function that returns a promise which can be used for making a remote API call. This callback function can receive a single parameter `context` which contains data/result from prior tasks and other properties from initial context object passed to `Transaction` constructor. To access, data from prior tasks, you can access by `context.data[taskName]`
  * rollback - a callback function that will be called in case if the task fails

To emulate `rollback` process as in a transaction for traditional RDBMS, you can define a rollback promise to be made if a particular step fails. If no rollback is required for a particular step, you can simply define a function that returns a resolved promise: `() => Promise.resolve()` 

To use the `Transaction` class from this package, you can intialize with the first parameter as an array that contains task list you want to execute. Tasks will be executed in the same order you pass sequentially. Second parameter, can be an initial context object which will be just normal literal Javascript object. 


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
  console.log(result); // should be value of 9 = 3 x 3
});

```





