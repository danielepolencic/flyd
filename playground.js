var stream = require('./flyd.js').stream;
var flyd = require('./flyd.js');
// var Flyd = require('./alternate.js');

// var m = new Flyd();

var s1 = stream();
var s2 = stream();

var sum = stream(function () {
  return s1() + s2()
})

// flyd.on(console.log.bind(console, '1'), s1);
// flyd.on(console.log.bind(console, '2'), s2);
flyd.on(console.log.bind(console, 'sum'), sum);

s1(12);
s2(1)
// console.log(sum())

// var s1 = m.stream();
// var s2 = m.stream(function() {
//   s1(); s1();
// });
// var s3 = m.stream(function() {
//   s1(); s2(); s1();
// });
// var s4 = m.stream(function() {
//   s1(); s2(); s3(); s1(); s3();
// });
// var s5 = m.stream(function() {
//   s3(); s2(); s1(); s3(); s4();
// });

// m.on(console.log.bind(console, '>>>'), s5);
