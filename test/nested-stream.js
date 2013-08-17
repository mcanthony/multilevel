var getDb = require('./util').getDb
var test = require('tape')
var sublevel = require('level-sublevel')

require('./util')(function (test, _, getDb) {

  test('nested-stream', function (t) {
    t.plan(4)

    getDb(function (db) {
      sublevel(db)
      db.sublevel('foo')
    },
    function (db, dispose) {
      db = db.sublevels['foo'];
      db.put('foo', 'bar', function (err) {
        if (err) throw err
        var i = 0
        db.createReadStream()
        .on('data', function (data) {
          console.log('DATA', ++i, data)
          t.equal(data.key, 'foo')
          t.equal(data.value, 'bar')
        })
        .on('end', function () {
          var stream = db.writeStream()
          stream.write({ key : 'bar', value : 'baz' })
          stream.on('close', function () {
            // temporary fix for level-js
            setTimeout(function () {
              db.get('bar', function (err, value) {
                t.notOk(err);
                t.equal(value, 'baz');
                dispose();
              });
            }, 100);
          })
          stream.end()
        })
      })
    })
  })
})
