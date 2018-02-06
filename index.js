var express = require('express');
var ODataServer = require("simple-odata-server");
var MongoClient = require('mongodb').MongoClient;
var mongoAdapter = require('simple-odata-server-mongodb');
var cors = require("cors");
var item = require('./models/item');
var continent = require('./models/continent');
var country = require('./models/country');
var countryContinent = require('./models/countryContinent');

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
        "items": { entityType: "jsreport.ItemType" },
        "continents": { entityType: "jsreport.ContinentType" },
        "countries": { entityType: "jsreport.CountryType" },
        "countryContinents": { entityType: "jsreport.CountryContinentType" }
    }
};

var odataServer = ODataServer()
    .model(model);

MongoClient.connect("mongodb://admin:admin@ds115198.mlab.com:15198/webshop", function(err, client) {
    const myAwesomeDB = client.db('webshop');
    odataServer.adapter(mongoAdapter(function(cb) {cb(err, myAwesomeDB); }));
});


app.use("/", function (req, res) {
    odataServer.handle(req, res);
});

var server = app.listen(PORT, function () {
    console.log('Server running at http://localhost:' + PORT + '');
});