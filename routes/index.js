const express = require('express');
const router = express.Router();
const async = require('async');
const Item = require('../models/item');
const Category = require('../models/category');

router.get('', (req, res, next) => {
    async.parallel({
        items: function(callback) {
            Item.countDocuments({}, callback);
        },
        categories: function(callback) {
            Category.countDocuments({}, callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        res.render('index', { title: "Inventory Overview", item_count: results.items, category_count: results.categories });
    });
})

module.exports = router;