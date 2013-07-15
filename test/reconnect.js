var getLocalDb = require('./util').getLocalDb;
var multilevel = require('..');
var test = require('tap').test;

test('reconnect', function (t) {
  t.plan(3);

  getLocalDb(function (db) {
    var server = multilevel.server(db);
    var client = multilevel.client();

    setTimeout(function () {
      console.log('hit timeout')
      var rpc = client.createRpcStream();
      server.pipe(client.createRpcStream()).pipe(server);
    }, 10);

    client.put('foo', 'bar', function (err) {
      console.log('put')
      t.error(err);
      client.get('foo', function (err, val) {
        t.error(err);
        t.equals(val, 'bar');
      });
    });
  });
});