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
const PORT = process.env.PORT || 5000;
app.use(cors());

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

/continetFilter/items?$filter=countryCode eq 'AF'&continents=['AF','EU']
app.get("/continetFilter", function (req, res, next) {

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
        },
        /*
         * Third external endpoint
         */

        function (callback) {
            var url = 'http://localhost:' + PORT + '/items';
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


        for(var i = 0; i < countryContinentArray.length; i++) {
            for(var j = 0; j < results[2].value.length; j++) {
                if(countryContinentArray[i].countryCode === results[2].value[j].countryCode) {
                    results[2].value[j].continentCode = countryContinentArray[i].continentCode;
                }
            }
        }

        res.send({api3: results[2]});
    });

});

app.use("/", function (req, res) {
    odataServer.handle(req, res);
});

var server = app.listen(PORT, function () {
    console.log('Server running at http://localhost:' + PORT + '');
});