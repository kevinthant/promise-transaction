import debugFactory from 'debug';
import promiseRetry from 'promise-retry';

class Transaction {

  constructor(tasks, initialContext) {
    this.tasks = tasks || [];
    this.debug = debugFactory('promise-transaction');
    this.initialContext = initialContext || {};
  }

  addTask(task) {
    this.tasks.push(task);
    return this;
  }

  process() {
    this.context = Object.assign({}, this.initialContext, {
      data: {},
      prevTaskName: null,
      tasksDone: [],
    });

    return this.tasks.reduce((prevPerform, task) => {
      const { name, perform } = task;

      return prevPerform.then((result) => {
        if (this.context.prevTaskName) {
          this.context.data[this.context.prevTaskName] = result;
          this.context.tasksDone.push(this.context.prevTaskName);
        }
        this.context.prevTaskName = name;
        return promiseRetry((retry) => {
          return perform(this.context)
              .catch((err) => {
                this.debug(`Error encountered in performing task ${name}`, err);
                retry(err);
              });
        }, { retries: task.retries || 2 });
      });
    }, Promise.resolve('initial'));
  }

  rollback() {
    const rollbacks = this.context.tasksDone.map(name => this.getTask(name).rollback(this.context));
    return Promise.all(rollbacks).catch((err) => {
      this.debug('Fail to rollback transaction tasks', err);
    });
  }

  getContext() {
    return this.context;
  }

  getTask(name) {
    const result = this.tasks.find(task => task.name === name);
    if (!result) {
      this.debug(`getTask method cannot find the given task name ${name}`);
    }
    return result;
  }
}

export default Transaction;