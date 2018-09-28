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
      let firstStoredData = {
        stock: '',
        ips: ['test ip'],
        likes: 0
      };
      let secondStoredData = {
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
        axios.get('https://api.iextrading.com/1.0/stock/' + firstStock + '/batch?types=quote,news,chart&range=1m&last=1').then(firstJson => {
          axios.get('https://api.iextrading.com/1.0/stock/' + secondStock + '/batch?types=quote,news,chart&range=1m&last=1').then(secondJson => {


            let firstPrice = firstJson.data.quote.latestPrice;
            let secondPrice = secondJson.data.quote.latestPrice;
            let ip = req.headers['x-forwarded-for'];
            let ipArray = ip.split(',');
            ip = ipArray[0];
            //storedData.ips.push(ip);

            MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
              let dbo = db.db("fcc-cert6-project4");
              let collection = dbo.collection('stocks');
              collection.findOne({stock: firstStock}, function(err, firstDoc) {
                collection.findOne({stock: secondStock}, function(err, secondDoc) {
                
                if (firstDoc) {
                  if (secondDoc) { // firstStock in db, and secondStock exists in db
                    if (like === true) { // like in query so add ips to stock ips and show rel like on return
                      
                      collection.findOne({stock: firstStock}, function(err, doc) {
                        if (!firstDoc.ips.includes(ip) && !secondDoc.ips.includes(ip)) { // ip is not in stock array for likes so add it
                          //firstStoredData.ips.push(ip);
                          //secondStoredData.ips.push(ip);
                          // maybe need to addToSet in update
                          // also inc likes for both
                          // docs already exist so no need to add their stock name
                          collection.findOneAndUpdate({ stock: firstStock }, { $inc: { likes: 1 } }, function(err, doc) {
                            collection.findOneAndUpdate({ stock: secondStock }, { $inc: { likes: 1 } }, function(err, doc) {
                              collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                                collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                                  let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, likes: firstStockDoc.likes };
                                  let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, likes: secondStockDoc.likes };
                                  console.log('firstStockData');
                                  console.log(firstStockData);
                                  stockDataArray.push(firstStockData);
                                  stockDataArray.push(secondStockData);
                                  console.log(stockDataArray);
                                  res.send(stockDataArray);
                                  
                                  //stockData = { stock: doc.stock, price: price, likes: doc.likes };
                                  //res.send(stockData);
                                });
                              });
                            });
                          });
                        } else if (!firstDoc.ips.includes(ip)) {
                          
                        } else if (!secondDoc.ips.includes(ip)) {
                          
                        } else { // ip is already in stock array for likes
                          collection.findOne({stock: firstStock}, function(err, doc) {
                            //stockData = { stock: doc.stock, price: price, likes: doc.likes };
                            res.send(stockData);
                          });
                        }
                      });
                    } else { // no like in query but stock exists in db
                      collection.findOne({stock: firstStock}, function(err, doc) {
                        //stockData = { stock: doc.stock, price: price, likes: doc.likes };
                        res.send(stockData);
                      });
                    }
                  } else { // firstStock in db, but secondStock not in db
                    
                  }

                } else { // no doc returned from db so not stock there for firstStock
                  
                  // check if secondDoc returned from db for secondStock
                  if (secondDoc) { // no firstStock in db, but secondStock in db
                  

                    firstStoredData.stock = firstStock;
                    if (like === true) firstStoredData.likes = 1;
                    firstStoredData.price = firstPrice;

                    // add doc returned to stockDataArray
                    collection.insertOne(storedData, function(err, doc) {

                      collection.findOne({stock: firstStock}, function(err, doc) {
                        //stockData = { stock: doc.stock, price: price, likes: doc.likes };
                        res.send(stockData);
                      });

                    });
                  } else { // no firstStock and no secondStock in db
                    
                  }

                }
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                /*
                if (doc) { // if firstStock exists in db
                  // and if like query === true and ip not already in ips on stock in db 
                  // then add ip and increment likes to stock in db

                } else { // firstStock does not exist in db

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
                */
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



            });
            
            
            
          }).catch(error => {
            console.log(error);
          });
        }).catch(error => {
          console.log(error);
        });
      } else {
        console.log('there is only one stock');
        axios.get('https://api.iextrading.com/1.0/stock/' + firstStock + '/batch?types=quote,news,chart&range=1m&last=1').then(json => {
          // first get storedData and send to db
          // next get that sent data from db and save to stockData
          // last show stockData
          
          //console.log(json.data.quote.latestPrice);
          let price = json.data.quote.latestPrice;
          let ip = req.headers['x-forwarded-for'];
          let ipArray = ip.split(',');
          ip = ipArray[0];
          
          
          MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
            let dbo = db.db("fcc-cert6-project4");
            let collection = dbo.collection('stocks');
            collection.findOne({stock: firstStock}, function(err, doc) {
              if (doc) {
                // and if like query === true and ip not already in ips on stock in db 
                // then add ip and increment likes to stock in db
                if (like === true) {
                  collection.findOne({stock: firstStock}, function(err, doc) {
                    if (!doc.ips.includes(ip)) { // ip is not in stock array for likes so add it
                      storedData.ips.push(ip);
                      collection.findOneAndUpdate(
                        { stock: firstStock },
                        { $inc: { likes: 1 } },
                        function(err, doc) {
                          collection.findOne({stock: firstStock}, function(err, doc) {
                            stockData = {
                              stock: doc.stock,
                              price: price,
                              likes: doc.likes
                            };
                            res.send(stockData);
                          });
                      });
                    
                    } else { // ip is already in stock array for likes
                      collection.findOne({stock: firstStock}, function(err, doc) {
                        stockData = {
                          stock: doc.stock,
                          price: price,
                          likes: doc.likes
                        };
                        res.send(stockData);
                      });
                    }
                    
                  });
                  
                } else { // no like in query but stock exists in db
                  collection.findOne({stock: firstStock}, function(err, doc) {
                    stockData = {
                      stock: doc.stock,
                      price: price,
                      likes: doc.likes
                    };
                    res.send(stockData);
                  });
                }
                
              } else { // no stock in db
                
                storedData.stock = firstStock;
                if (like === true) {
                  storedData.likes = 1;
                  storedData.ips.push(ip);
                }
                
                // add doc returned to stockDataArray
                collection.insertOne(storedData, function(err, doc) {
                  
                  collection.findOne({stock: firstStock}, function(err, doc) {
                    stockData = {
                      stock: doc.stock,
                      price: price,
                      likes: doc.likes
                    };
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
