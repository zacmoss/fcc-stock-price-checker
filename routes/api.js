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
        firstStock = req.query.stock[0];
        secondStock = req.query.stock[1];
      } else {
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
                      
                      // WORKS but need to add rel_likes
                      // this findOne is maybe redundant
                        if (!firstDoc.ips.includes(ip) && !secondDoc.ips.includes(ip)) { // ip is not in stock array for likes so add it
                          collection.findOneAndUpdate({ stock: firstStock }, { $inc: { likes: 1 }, $addToSet: { ips: ip } }, function(err, doc) {
                            collection.findOneAndUpdate({ stock: secondStock }, { $inc: { likes: 1 }, $addToSet: { ips: ip }  }, function(err, doc) {
                              collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                                collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                                  
                                  /////////////// change this to rel_likes
                                  let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                                  let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                                  firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                                  secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                                  //let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, likes: firstStockDoc.likes };
                                  //let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, likes: secondStockDoc.likes };
                                  stockDataArray.push(firstStockData);
                                  stockDataArray.push(secondStockData);
                                  res.send(stockDataArray);
                                });
                              });
                            });
                          });
                        } else if (!firstDoc.ips.includes(ip)) { // only add ip and like to firstDoc
                          collection.findOneAndUpdate({ stock: firstStock }, { $inc: { likes: 1 }, $addToSet: { ips: ip } }, function(err, doc) {
                            collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                              collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                                let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                                let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                                firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                                secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                                stockDataArray.push(firstStockData);
                                stockDataArray.push(secondStockData);
                                res.send(stockDataArray);
                              });
                            });  
                          });
                        } else if (!secondDoc.ips.includes(ip)) { // only add ip and like to secondDoc
                          collection.findOneAndUpdate({ stock: secondStock }, { $inc: { likes: 1 }, $addToSet: { ips: ip } }, function(err, doc) {
                            collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                              collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                                let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                                let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                                firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                                secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                                stockDataArray.push(firstStockData);
                                stockDataArray.push(secondStockData);
                                res.send(stockDataArray);
                              });
                            });  
                          });
                        } else { // ip is already in stock array for likes
                          collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                            collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                              let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                              let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                              firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                              secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                              stockDataArray.push(firstStockData);
                              stockDataArray.push(secondStockData);
                              res.send(stockDataArray);
                            });
                          });
                        }
                    } else { // no like in query but both stocks exist in db
                      collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                        collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                          let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                          let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                          firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                          secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                          stockDataArray.push(firstStockData);
                          stockDataArray.push(secondStockData);
                          res.send(stockDataArray);
                        });
                      });
                    }
                  } else { // firstStock in db, but secondStock not in db
                    
                    storedData.stock = secondStock;
                                        
                    if (like === true) { // like in query
                      storedData.likes = 1;
                      storedData.ips.push(ip);
                      if (!firstDoc.ips.includes(ip)) { // firstStock doesn't have ip in likes
                        collection.findOneAndUpdate({ stock: firstStock }, { $inc: { likes: 1 }, $addToSet: { ips: ip } }, function(err, doc) {
                          collection.insertOne(storedData, function(err, doc) {
                            collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                              collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                                let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                                let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                                firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                                secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                                stockDataArray.push(firstStockData);
                                stockDataArray.push(secondStockData);
                                res.send(stockDataArray);
                              });
                            });
                          });
                        });
                      } else { // firstStock already has ip in likes
                        collection.insertOne(storedData, function(err, doc) {
                          collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                            collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                              let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                              let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                              firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                              secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                              stockDataArray.push(firstStockData);
                              stockDataArray.push(secondStockData);
                              res.send(stockDataArray);
                            });
                          });
                        });
                      }
                    } else { // like not in query // create second stock in db and show both
                      collection.insertOne(storedData, function(err, doc) {
                        collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                          collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                            let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                            let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                            firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                            secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                            stockDataArray.push(firstStockData);
                            stockDataArray.push(secondStockData);
                            res.send(stockDataArray);
                          });
                        });
                      });
                    }
                  }
                } else { // no doc returned from db so no stock there for firstStock
                  
                  if (secondDoc) { // no firstStock in db, but secondStock in db
                    storedData.stock = firstStock;
                    if (like === true) { // like in query // create firstStock in db
                      storedData.likes = 1;
                      storedData.ips.push(ip);
                      if (!secondDoc.ips.includes(ip)) { // secondStock doesn't have ip in likes
                        collection.findOneAndUpdate({ stock: secondStock }, { $inc: { likes: 1 }, $addToSet: { ips: ip } }, function(err, doc) {
                          collection.insertOne(storedData, function(err, doc) {
                            collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                              collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                                let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                                let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                                firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                                secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                                stockDataArray.push(firstStockData);
                                stockDataArray.push(secondStockData);
                                res.send(stockDataArray);
                              });
                            });
                          });
                        });
                      } else { // secondStock already has ip in likes // create firstStock
                        collection.insertOne(storedData, function(err, doc) {
                          collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                            collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                              let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                              let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                              firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                              secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                              stockDataArray.push(firstStockData);
                              stockDataArray.push(secondStockData);
                              res.send(stockDataArray);
                            });
                          });
                        });
                      }
                    } else { // no like in query // create firstStock in db
                      collection.insertOne(storedData, function(err, doc) {
                        collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                          collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                            let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                            let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                            firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                            secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                            stockDataArray.push(firstStockData);
                            stockDataArray.push(secondStockData);
                            res.send(stockDataArray);
                          });
                        });
                      });
                    }
                  } else { // no firstStock and no secondStock in db
                    firstStoredData.stock = firstStock;
                    secondStoredData.stock = secondStock;
                    if (like === true) { // like in query // create both stocks add like and ip
                      firstStoredData.likes = 1;
                      firstStoredData.ips.push(ip);
                      secondStoredData.likes = 1;
                      secondStoredData.ips.push(ip);
                      collection.insertOne(firstStoredData, function(err, doc) {
                        collection.insertOne(secondStoredData, function(err, doc) {
                          collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                            collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                              let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                              let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                              firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                              secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                              stockDataArray.push(firstStockData);
                              stockDataArray.push(secondStockData);
                              res.send(stockDataArray);
                            });
                          });
                        });
                      });
                    } else { // no like in query // create both stocks in db
                      collection.insertOne(firstStoredData, function(err, doc) {
                        collection.insertOne(secondStoredData, function(err, doc) {
                          collection.findOne({stock: firstStock}, function(err, firstStockDoc) {
                            collection.findOne({stock: secondStock}, function(err, secondStockDoc) {
                              let firstStockData = { stock: firstStockDoc.stock, price: firstPrice, rel_likes: 0 };
                              let secondStockData = { stock: secondStockDoc.stock, price: secondPrice, rel_likes: 0};
                              firstStockData.rel_likes = firstStockDoc.likes - secondStockDoc.likes;
                              secondStockData.rel_likes = secondStockDoc.likes - firstStockDoc.likes;
                              stockDataArray.push(firstStockData);
                              stockDataArray.push(secondStockData);
                              res.send(stockDataArray);
                            });
                          });
                        });
                      });
                    }
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
                    stockData = { stock: doc.stock, price: price, likes: doc.likes };
                    res.send(stockData);
                  });
                });
              }
            })
          })
        }).catch(error => {
          //console.log(error);
        });
      }
    });
};
