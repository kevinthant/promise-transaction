# promise-transaction
Small library written in Node JS for making multiple promise calls in emulated ACID transaction manner in traditional database system although not exactly same. But still offer all or nothing approch with option for multiple retries in each step of a transaction.


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





