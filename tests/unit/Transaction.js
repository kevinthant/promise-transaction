import { expect } from 'chai';
import sinon from 'sinon';
import Transaction from './../../src/Transaction';

describe('Transaction helper class', () => {
  it('check basic operation with all success', () => {
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
  });

  it('check for rollback operation on failure', () => {
    const foo = {
      name: 'foo',
      perform: () => Promise.resolve(true),
      rollback: sinon.stub().returns(Promise.resolve(true)),
    };

    const bar = {
      name: 'bar',
      perform: sinon.stub().returns(Promise.reject('Failing in bar')),
      rollback: sinon.stub().returns(Promise.resolve(true)),
    };

    const t = new Transaction([foo, bar]);
    return t.process().then(() => {
      expect(false).to.equal(true, 'Should never get here');
    }).catch((err) => {
      expect(err).to.equal('Failing in bar');
      return t.rollback().then(() => {
        expect(bar.perform.getCalls().length).to.equal(3); // by default should retries for 3 times
        expect(foo.rollback.called).to.equal(true);
        expect(bar.rollback.called).to.equal(false);
      });
    });
  });

  it('check for rollback operation on failure with custom retry limit of 2 times', () => {
    const foo = {
      name: 'foo',
      perform: () => Promise.resolve(true),
      rollback: sinon.stub().returns(Promise.resolve(true)),
    };

    const bar = {
      name: 'bar',
      perform: sinon.stub().returns(Promise.reject('Failing in bar')),
      rollback: sinon.stub().returns(Promise.resolve(true)),
      retries: 1,
    };

    const t = new Transaction([foo, bar]);
    return t.process().then(() => {
      expect(false).to.equal(true, 'Should never get here');
    }).catch((err) => {
      expect(err).to.equal('Failing in bar');
      return t.rollback().then(() => {
        expect(bar.perform.getCalls().length).to.equal(2); // should retries for 2 times
        expect(foo.rollback.called).to.equal(true);
        expect(bar.rollback.called).to.equal(false);
      });
    });
  });

  it('check for scenario where first time failure but second time succeeeds', () => {
    const foo = {
      name: 'foo',
      perform: () => Promise.resolve(true),
      rollback: sinon.stub().returns(Promise.resolve(true)),
    };


    const bar = {
      name: 'bar',
      perform: sinon.stub(),
      rollback: sinon.stub().returns(Promise.resolve(true)),
      retries: 1,
    };

    // fail it first time, succeed it on second time
    bar.perform.onCall(0).returns(Promise.reject('Failing in bar'));
    bar.perform.returns(Promise.resolve('second time success'));

    const t = new Transaction([foo, bar]);
    return t.process().then((result) => {
      expect(result).to.equal('second time success');
      expect(bar.perform.getCalls().length).to.equal(2);
      expect(bar.rollback.called).to.equal(false);
      expect(foo.rollback.called).to.equal(false);
    });
  });
});
