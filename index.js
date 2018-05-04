var express = require('express');
var ODataServer = require("simple-odata-server");
var MongoClient = require('mongodb').MongoClient;
var mongoAdapter = require('simple-odata-server-mongodb');
var cors = require("cors");
var item = require('./models/item');
var continent = require('./models/continent');
var country = require('./models/country');
var countryContinent = require('./models/countryContinent');
var request = require('request');
var async = require('async');

var app = express();
var bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
app.use(cors());

var _ = require('lodash');


var CartModel = require('./cartModel');

var cartModel = new CartModel();

console.log('fut a server');

var model = {
    namespace: "jsreport",
    entityTypes: {
        "ItemType": item,
        "ContinentType": continent,
        "CountryType": country,
        "CountryContinentType": countryContinent
    },
    entitySets: {
        "items": {entityType: "jsreport.ItemType"},
        "continents": {entityType: "jsreport.ContinentType"},
        "countries": {entityType: "jsreport.CountryType"},
        "countryContinents": {entityType: "jsreport.CountryContinentType"}
    }
};

var odataServer = ODataServer()
    .model(model);

MongoClient.connect("mongodb://admin:admin@ds115198.mlab.com:15198/webshop", function (err, client) {
    const myAwesomeDB = client.db('webshop');
    odataServer.adapter(mongoAdapter(function (cb) {
        cb(err, myAwesomeDB);
    }));
});

app.get("/helper", function(req, res) {

    var requests = [function (callback) {
        var url = 'http://localhost:' + PORT + '/countryContinents';
        request(url, function (err, response, body) {
            // JSON body
            if (err) {
                console.log(err);
                callback(true);
                return;
            }
            obj = JSON.parse(body);
            callback(false, obj);
        });
    },
        /*
         * Second external endpoint
         */
        function (callback) {
            var url = 'http://localhost:' + PORT + '/countries';
            request(url, function (err, response, body) {
                // JSON body
                if (err) {
                    console.log(err);
                    callback(true);
                    return;
                }
                obj = JSON.parse(body);
                callback(false, obj);
            });
        }];

    async.parallel(requests, function (err, results) {
        if (err) {
            console.log(err);
            res.send(500, "Server Error");
            return;
        }

        var countryContinentArray = [];

        for(var i = 0; i < results[0].value.length; i++) {
            for(var j = 0; j < results[1].value.length; j++) {
                if(results[0].value[i].country === results[1].value[j].name) {
                    countryContinentArray.push({countryCode: results[1].value[j].code, continentCode: results[0].value[i].continent});
                }
            }
        }

        res.send({countryContinentArray: countryContinentArray});
    });


});

app.get("/continentFilter", function (req, res, next) {

    var requests = [function (callback) {
        var url = 'http://localhost:' + PORT + '/helper';
        request(url, function (err, response, body) {
            // JSON body
            if (err) {
                console.log(err);
                callback(true);
                return;
            }
            obj = JSON.parse(body);
            callback(false, obj);
        });
    },
        /*
         * Second external endpoint
         */
        function (callback) {
            var url = 'http://localhost:' + PORT + '/items?$filter=' + req.query.$filter;

            request(url, function (err, response, body) {
                // JSON body
                if (err) {
                    console.log(err);
                    callback(true);
                    return;
                }
                obj = JSON.parse(body);
                callback(false, obj);
            });
        }];

    async.parallel(requests, function (err, results) {
        if (err) {
            console.log(err);
            res.send(500, "Server Error");
            return;
        }

        var itemsToReturn = [];
        var continentCodeArray = [];

        if(typeof req.query.continentCode === "string") {
            continentCodeArray.push(req.query.continentCode);
        } else if(typeof req.query.continentCode === "object"){
            continentCodeArray = req.query.continentCode;
        }

        for(var i = 0; i < results[0].countryContinentArray.length; i++) {
            for(var j = 0; j < results[1].value.length; j++) {
                if(results[0].countryContinentArray[i].countryCode === results[1].value[j].countryCode) {
                    results[1].value[j].continentCode = results[0].countryContinentArray[i].continentCode;
                }
            }
        }


        if(continentCodeArray.length) {
            for (var i = 0; i < continentCodeArray.length; i++) {
                for (var j = 0; j < results[1].value.length; j++) {
                    if (continentCodeArray[i] === results[1].value[j].continentCode) {
                        itemsToReturn.push(results[1].value[j]);
                    }
                }
            }
        } else {
            itemsToReturn = results[1].value;
        }

        res.send({continentFilteredItems: itemsToReturn});
    });

});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/addItem', function (req, res) {
    var cartId = req.body.cartId;
    var itemId = req.body.item._id;
    var quantity = req.body.quantity;
    var imageUrl = req.body.imageUrl;


    if(cartId === 'undefined') {
        var uniqueId = _.uniqueId('cartId-');
        cartModel.sessions.push({cartId : uniqueId, cart : [], imageUrl: imageUrl});
        res.send({cart: []});
    } else {
        cartModel.add(cartId, itemId, quantity, imageUrl);
        res.send({cart: cartModel.get(cartId)});
    }
});

// ^^
// for (var i = 0; i < cartArray.length; i++) {
//     if (cartArray[i].item._id === item._id) {
//         cartArray[i].quantity += quantity;
//         isItemAlreadyInCartArray = true;
//         break;
//     }
// }
//
// if(!isItemAlreadyInCartArray)
//     cartArray.push({item: item, quantity: quantity, imageUrl: imageUrl});
//
// subTotal += req.body.item.price * quantity;





app.put('/putItem', function(req, res) {
    var cartId = req.body.cartId;
    var itemId = req.body.itemId;
    var quantity = req.body.quantity;

    if(quantity >= 0) {
       cartModel.put(cartId, itemId, quantity);
       res.send('PUT accomplished');
    } else {
       res.send('Quantity is a negative.');
    }
});

app.delete('/deleteItem', function(req, res) {
    var cartId = req.body.cartId;

    var itemId = req.body.itemId;

    if(cartModel.delete(cartId, itemId)) {
        res.send('Item deleted succesfully.')
    } else {
        res.send('Item not found.')
    };
});

app.get('/subTotal', function(req, res) {
    var cartId = req.body.cartId;

    if(cartId === undefined) {
        res.send({subTotal: 0});
    } else {
        var userCart = cartModel.cartById(cartId);

        if(userCart !== null) {
            var subTotal = 0;
            var url = "http://localhost:5000/items?$filter=";

            for(var i = 0; i < userCart.length; i++) {
                url += "_id eq '" + userCart.itemId + "'&";
            }

            var requests = [function (callback) {
                request(url, function (err, response, body) {
                    // JSON body
                    if(err) {
                        console.log(err);
                        callback(true);
                        return;
                    }

                    obj = JSON.parse(body);
                    callback(false, obj);
                });
            }];

            async.parallel(requests, function (err, results) {
                if (err) {
                    console.log(err);
                    res.send(500, "Server Error");
                    return;
                }

                var query = results[0].value;

                for(var i = 0; i < userCart.length; i++) {
                    for(var j = 0; j < query.length; j++) {
                        if(userCart[i].itemId === query[j]._id) {
                            subTotal += userCart[i].quantity * query[j].price;
                            break;
                        }
                    }
                }

                res.send({subTotal : subTotal});
            });

        } else {
            res.send({subTotal: 0});
        }
    }
});

app.get('/getCart', function(req, res) {
    var cartId = req.query.cartId;

    if(cartId === 'undefined'){
        var uniqueId = _.uniqueId('cartId-');
        cartModel.sessions.push({cartId: uniqueId, cart: []});
        res.send({cart: [], cartId: uniqueId});
    } else {
        if(cartModel.get(cartId) === null) {
            cartModel.sessions.push({cartId: cartId, cart: []});
            res.send({cart: []});
        } else
            res.send({cart: cartModel.get(cartId)});
    }
});

app.use("/", function (req, res) {
    odataServer.handle(req, res);
});

var server = app.listen(PORT, function () {
    console.log('Server running at http://localhost:' + PORT + '');
});