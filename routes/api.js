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
      if (req.query.like) {
        console.log('like');
      }
      let storedData = {
        ticker: '',
        price: '',
        likes: 0
      };
      
      let stockData = {};
    
    // companyName   symbol    
    axios.get('https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news,chart&range=1m&last=1').then(json => {
      res.send(json.data.quote);
      console.log(json);
    }).catch(error => {
      console.log(error);
    });
    });
    
};
