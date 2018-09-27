/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
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
        console.log('there is a second stock');
        axios.get('https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news,chart&range=1m&last=1').then(json => {
          // if like = true find stock in db if stock doesn't exist create it
          // increment that db items likes if like is true
          // next get that sent data from db and save to stockData
          // last show stockData in res.send
          //res.send(json.data.quote);
          //console.log(json);
          MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
            let dbo = db.db("fcc-cert6-project4");
            let collection = dbo.collection('stocks');
            collection.findOne({stock: firstStock}, function(err, doc) {
              if (err) {res.send(err)} else {res.send(doc)};
              
            })
            
          });
            
            
            
            
        }).catch(error => {
          console.log(error);
        });
      } else {
        console.log('there is only one stock');
        axios.get('https://api.iextrading.com/1.0/stock/aapl/batch?types=quote,news,chart&range=1m&last=1').then(json => {
          // first get storedData and send to db
          // next get that sent data from db and save to stockData
          // last show stockData
          res.send(json.data.quote);
          console.log(json);
        }).catch(error => {
          console.log(error);
        });
      }
    
      
    });
    
};
