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
var nodemailer = require('./models/email.sender');
var app = express();

const PORT = process.env.PORT || 5000;
app.use(cors());

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

app.get("/helper", function(req, res, next) {

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

// /continetFilter/items?$filter=countryCode eq 'AF'&continents=['AF','EU']
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

app.use("/", function (req, res) {
    odataServer.handle(req, res);
});

var server = app.listen(PORT, function () {
    console.log('Server running at http://localhost:' + PORT + '');
});

var nodeMailer = new nodemailer();
nodeMailer.sendMail('hiyej94@gmail.com', 'Epam-grocery-webshop order', 'test message');