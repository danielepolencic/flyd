var timers = require('timers');

module.exports = Flyd;

function Stream (manager, id) {

  function stream (value) {
    return (arguments.length === 1) ?
      manager._write(id, value) :
      manager._read(id);
  }

  stream.id = id;
  stream.map = function (fn) {
    return manager.map(fn, this);
  }

  return stream;
}

function Flyd () {
  this._count = 0;
  this._topology = {};
  this._graph = {};
}

Flyd.prototype.stream = function () {
  return (arguments.length <= 1) ?
    this._simpleStream.apply(this, arguments) :
    this._dependentStream.apply(this, arguments);
}

Flyd.prototype._simpleStream = function (value) {
  var index = (this._count += 1);
  this[index] = {
    value: (isFunction(value) ? void 0 : value),
    fn: (isFunction(value) ? value : identity)
  };
  return Stream(this, index);
}

Flyd.prototype._addDependencies = function (graph, deps, index) {
  for (var i = 0, len = deps.length; i < len; i += 1) {
    graph[deps[i].id] = Array.isArray(graph[deps[i].id]) ?
      graph[deps[i].id].concat(index) : [index];
  }
  return graph;
}

Flyd.prototype._updateTopology = function (graph) {
  var topology = {};
  var nodes = Object.keys(graph);
  for (var i = 0, len = nodes.length; i < len; i += 1) {
    topology[nodes[i]] = sort(graph, nodes[i] | 0).reverse();
  }
  return topology;
}

Flyd.prototype._dependentStream = function (deps, fn) {
  var index = (this._count += 1);
  this._graph = this._addDependencies(this._graph, deps, index);
  this[index] = {value: fn(), fn: fn};
  this._topology = this._updateTopology(this._graph);
  return Stream(this, index);
}

Flyd.prototype._read = function (id) {
  return this[id].value;
}

Flyd.prototype._write = function (id, value) {

  if (Array.isArray(this._topology[id])) {
    for (var i = 0, len = this._topology[id].length; i < len; i += 1) {
      var depId = this._topology[id][i];
      this[depId].value = this[depId].fn.call(void 0, value);
    }
  } else {
    this[id].value = this[id].fn.call(void 0, value);
  }

  return this[id].value;
}

Flyd.prototype.on = function (fn, stream) {
  return this._dependentStream([stream], function () {
    fn(stream());
  });
}

Flyd.prototype.map = function (fn, stream) {
  return this._dependentStream([stream], function () {
    return fn(stream());
  });
}

function identity (a) { return a; }

function isFunction (a) {
  return ({}).toString.call(a) === '[object Function]';
}

function sort (graph, index) {
  var sorted = [];
  var marks = {};

  if (!marks[index]) visit(index);

  return sorted;

  function visit(node) {
    if (marks[node] === 'temp')
      throw new Error('There is a cycle in the graph. It is not possible to derive a topological sort.');
    else if (marks[node])
      return;

    marks[node] = 'temp';
    (graph[node] || []).forEach(visit);
    marks[node] = 'perm';

    sorted.push(node);
  }
};


// var m = new Flyd();

// s1 = m.stream(1)
// s1(2)

// s2 = m.stream(3)
// s2(4)

// s = m.stream([s1, s2], function (self, changed) {
//   return s1() + s2()
// })

// m.on(console.log.bind(console, 's >>> '), s);

// console.log(s1()) // 2
// console.log(s2()) // 4

// s3 = s2.map(function (x) { return x*x; })
// m.on(console.log.bind(console, 's3 >>> '), s3);

// debugger;
// s1(3)
// s2(6)
