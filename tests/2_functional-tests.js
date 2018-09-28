/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.stock, 'goog');
          assert.property(res.body, 'price', 'stockData should contain price');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.stock, 'goog');
          assert.isAbove(res.body.likes, 0);
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.stock, 'goog');
          assert.equal(res.body.likes, 5);
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices?stock=goog&stock=msft')
        //.query({stock: 'goog', stock: 'msft'})
        .end(function(err, res){
          console.log(res.body);
          assert.equal(res.status, 200);
          assert.equal(res.body[0].stock, 'goog');
          assert.equal(res.body[1].stock, 'msft');
          assert.property(res.body[0], 'price', 'First stock should contain price');
          assert.property(res.body[1], 'price', 'Second stock should contain price');
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices?stock=goog&stock=msft&like=true')
        //.query({stock: 'goog', stock: 'msft'})
        .end(function(err, res){
          console.log(res.body);
          assert.equal(res.status, 200);
          assert.equal(res.body[0].stock, 'goog');
          assert.equal(res.body[1].stock, 'msft');
          assert.property(res.body[0], 'price', 'First stock should contain price');
          assert.property(res.body[1], 'price', 'Second stock should contain price');
          assert.isAbove(res.body[0].likes, 0);
          done();
        });
      });
      
    });

});
