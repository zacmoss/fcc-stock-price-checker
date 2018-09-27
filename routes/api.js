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
      let firstStock;
      let secondStock;
      let like;
      if (req.query.stock.length === 2) {
        //console.log('there is an array of stock queries');
        firstStock = req.query.stock[0];
        secondStock = req.query.stock[1];
      } else {
        //console.log('there is only one stock query');
        firstStock = req.query.stock;
      }
      
      console.log(firstStock + secondStock);
      if (req.query.like) {
        if (req.query.like == 'true') {
          like = true;
        }
      }
      let storedData = {
        ticker: '',
        price: '',
        likes: 0
      };
      
      let stockData = {};
      console.log(like);
    // companyName   symbol 
    if (secondStock) {
      console.log(secondStock);
    }
    axios.get('https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news,chart&range=1m&last=1').then(json => {
      res.send(json.data.quote);
      console.log(json);
    }).catch(error => {
      console.log(error);
    });
    });
    
};
