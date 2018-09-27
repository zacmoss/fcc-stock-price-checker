/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const axios = require('axios');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      let stock = req.query.stock;
    /*
      app.get('https://finance.google.com/finance/info?q=NASDAQ%3a' + stock, function(req, res) {
        console.log(req);
        console.log(res);
      });
      */
    // + '&output=json'
    /*
    axios.get(' https://finance.google.com/finance?q=NASDAQ:' + stock).then(json => {
      res.send(json.data);
      console.log(json);
    }).catch(error => {
      console.log(error);
    });
    */
    axios.get('https://api.iextrading.com/1.0').then(json => {
      console.log(json);
    }).catch(error => 
    });
    
};
