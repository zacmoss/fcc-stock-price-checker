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
        stock: '',
        ips: ['test ip'],
        likes: 0
      };
      
      let stockData = {}; // if there is only one stock
      let stockDataArray = []; // if there are two stocks compared
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
          //console.log(json.data.quote);
          
          let ip = req.headers['x-forwarded-for'];
          storedData.ips.push(ip);
          
          MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
            let dbo = db.db("fcc-cert6-project4");
            let collection = dbo.collection('stocks');
            collection.findOne({stock: firstStock}, function(err, doc) {
              if (doc) {
                // and if like query === true and ip not already in ips on stock in db 
                // then add ip and increment likes to stock in db
                
                // add doc returned to stockDataArray
              } else {
                
                // create stock in stock db
                storedData.stock = firstStock;
                if (like === true) storedData.likes = 1;
                
                // add doc returned to stockDataArray
                collection.insertOne(storedData, function(err, doc) {
                  
                  collection.findOne({stock: firstStock}, function(err, doc) {
                    stockDataArray.push(doc);
                    console.log(stockDataArray);
                  });
                  
                  //stockDataArray.push(doc);
                  //console.log(doc);
                });
              }
              /*
              collection.findOne({stock: secondStock}, function(err, doc) {
                if (doc) {
                  // and if like query === true then add ip and increment likes to stock in db
                  // add doc returned to stockDataArray
                  //res.send(stockDataArray);
                } else {
                  // create stock in stock db
                  // add doc returned to stockDataArray
                  //res.send(stockDataArray);
                }
                
              });
              */
            });
            
            
            
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
          
          
          let ip = req.headers['x-forwarded-for'];
          let ipAr
          storedData.ips.push(ip);
          
          MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
            let dbo = db.db("fcc-cert6-project4");
            let collection = dbo.collection('stocks');
            collection.findOne({stock: firstStock}, function(err, doc) {
              if (doc) {
                // and if like query === true and ip not already in ips on stock in db 
                // then add ip and increment likes to stock in db
                if (like === true) {
                  collection.findOne({stock: firstStock}, function(err, doc) {
                    if (!doc.ips.includes(ip)) {
                      console.log(doc.ips);
                      console.log(ip);
                      collection.findOneAndUpdate(
                        { stock: firstStock },
                        { $inc: { likes: 1 } },
                        function(err, doc) {
                          collection.findOne({stock: firstStock}, function(err, doc) {
                            stockData = doc;
                            res.send(stockData);
                          });
                      });
                    
                    } else { // ip is already in stock array for likes
                      collection.findOne({stock: firstStock}, function(err, doc) {
                        stockData = doc;
                        res.send(stockData);
                      });
                    }
                    
                  });
                  
                } else { // no like in query
                  collection.findOne({stock: firstStock}, function(err, doc) {
                    stockData = doc;
                    res.send(stockData);
                  });
                }
                
              } else { // no stock in db
                
                storedData.stock = firstStock;
                if (like === true) storedData.likes = 1;
                
                // add doc returned to stockDataArray
                collection.insertOne(storedData, function(err, doc) {
                  
                  collection.findOne({stock: firstStock}, function(err, doc) {
                    stockData = doc;
                    res.send(stockData);
                  });
                  
                });
                
              }
            })
          })
          
          
          
          //res.send(json.data.quote);
          //console.log(json);
        }).catch(error => {
          //console.log(error);
        });
      }
    
      
    });
    
};
