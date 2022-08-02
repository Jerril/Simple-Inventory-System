#! /usr/bin/env node

console.log('This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://inventory-app:inventory-app@cluster0.1rsm1.mongodb.net/?retryWrites=true&w=majority');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = [];
var items = [];

function categoryCreate(name, description, cb) {
    categorydetail = { name: name }

    if (description != false) categorydetail.description = description;

    const category = new Category(categorydetail);

    category.save(function(err) {
        if (err) {
            cb(err, null);
            return;
        }

        console.log('New Category ' + category);
        categories.push(category);
        cb(null, category);
    });
}

function itemCreate(name, description, price, number_in_stock, category, cb) {
    const itemdetail = { name: name, price: price, number_in_stock: number_in_stock }

    if (description != false) itemdetail.description = description;
    if (category != false) itemdetail.category = category;

    const item = new Item(itemdetail);

    item.save(function(err) {
        if (err) {
            cb(err, null);
            return;
        }

        console.log('New Item ' + item);
        items.push(item);
        cb(null, item);
    });
}

function createCategories(cb) {
    async.series([
            function(callback) {
                categoryCreate('Office Supply', 'Items primarily used in the office', callback);
            },
            function(callback) {
                categoryCreate('Stationery', 'Pen & papers kind of material', callback);
            },
            function(callback) {
                categoryCreate('Furniture', '', callback);
            },
            function(callback) {
                categoryCreate('Household Item', 'Item used mostly in the house', callback);
            },
            function(callback) {
                categoryCreate('Sport', 'Item used for sports', callback);
            },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
            function(callback) {
                itemCreate('Deep Freezer', '', 1000, 20, categories[3], callback);
            },
            function(callback) {
                itemCreate('Notebook', 'Hard-cover notebooks', 3, 100, categories[1], callback);
            },
            function(callback) {
                itemCreate('Pen', '', 1, 100, categories[1], callback);
            },
            function(callback) {
                itemCreate('Reading Table', 'Workspace table for workers', 200, 15, categories[2], callback);
            },
            function(callback) {
                itemCreate('Stapler', '', 5, 20, categories[0], callback);
            },
            function(callback) {
                itemCreate('Baseball bat', 'For baseball lovers', 20, 20, categories[0], callback);
            }
        ],
        // optional callback
        cb);
}

async.series([
        createCategories,
        createItems,
    ],
    // Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        } else {
            console.log('Items: ' + items);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });