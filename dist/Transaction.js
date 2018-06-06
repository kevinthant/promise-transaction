'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _promiseRetry = require('promise-retry');

var _promiseRetry2 = _interopRequireDefault(_promiseRetry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transaction = function () {
  function Transaction(tasks, initialContext) {
    _classCallCheck(this, Transaction);

    this.tasks = tasks || [];
    this.debug = (0, _debug2.default)('promise-transaction');
    this.initialContext = initialContext || {};
  }

  _createClass(Transaction, [{
    key: 'addTask',
    value: function addTask(task) {
      this.tasks.push(task);
      return this;
    }
  }, {
    key: 'process',
    value: function process() {
      var _this = this;

      this.context = Object.assign({}, this.initialContext, {
        data: {},
        prevTaskName: null,
        tasksDone: []
      });

      return this.tasks.reduce(function (prevPerform, task) {
        var name = task.name,
            perform = task.perform;


        return prevPerform.then(function (result) {
          if (_this.context.prevTaskName) {
            _this.context.data[_this.context.prevTaskName] = result;
            _this.context.tasksDone.push(_this.context.prevTaskName);
          }
          _this.context.prevTaskName = name;
          return (0, _promiseRetry2.default)(function (retry) {
            return perform(_this.context).catch(function (err) {
              _this.debug('Error encountered in performing task ' + name, err);
              retry(err);
            });
          }, { retries: task.retries || 2 });
        });
      }, Promise.resolve('initial'));
    }
  }, {
    key: 'rollback',
    value: function rollback() {
      var _this2 = this;

      var rollbacks = this.context.tasksDone.map(function (name) {
        return _this2.getTask(name).rollback(_this2.context);
      });
      return Promise.all(rollbacks).catch(function (err) {
        _this2.debug('Fail to rollback transaction tasks', err);
      });
    }
  }, {
    key: 'getContext',
    value: function getContext() {
      return this.context;
    }
  }, {
    key: 'getTask',
    value: function getTask(name) {
      var result = this.tasks.find(function (task) {
        return task.name === name;
      });
      if (!result) {
        this.debug('getTask method cannot find the given task name ' + name);
      }
      return result;
    }
  }]);

  return Transaction;
}();

exports.default = Transaction;