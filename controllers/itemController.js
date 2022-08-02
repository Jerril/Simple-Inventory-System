const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Item = require('../models/item');
const Category = require('../models/category');

// Display list of Items
exports.index = function(req, res, next) {
    async.parallel({
        categories: function(callback) {
            Category.find({}).exec(callback);
        },
        items: function(callback) {
            Item.find({})
                .sort({ _id: -1 })
                .populate('category')
                .exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        res.render('item_list', { title: "All Items", item_list: results.items, categories: results.categories, item: '', errors: '' });
    })
}

// Create new Item
exports.item_create_post = [

    // Convert category into an array
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            if (typeof req.body.category === 'undefined') {
                req.body.category = [];
            } else {
                req.body.category = [req.body.category];
            }
        }
        next();
    },

    // Validate Input fields
    body('name', 'Name must not be empty').trim().isLength({ min: 2 }).escape(),
    body('description', "Description must not be empty").trim().isLength({ min: 2 }).escape(),
    body('price', "Price must not be less than $1").isNumeric({ min: 1 }).escape(),
    body('number_in_stock', "Number in stock must not be less than 1").isNumeric({ min: 1 }).escape(),
    body('category.*').escape(),

    // if validation fails, render index page
    (req, res, next) => {

        // Extract the validation errors
        errors = validationResult(req);

        // Create new Item
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            number_in_stock: req.body.number_in_stock,
            category: req.body.category
        });

        if (!errors.isEmpty()) {
            // Redirect
            async.parallel({
                categories: function(callback) {
                    Category.find({}).exec(callback)
                },
                item_list: function(callback) {
                    Item.find({})
                        .sort({ _id: -1 })
                        .populate('category')
                        .exec(callback)
                }
            }, function(err, results) {
                if (err) return next(err);

                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].selected = true;
                    }
                }

                res.render('item_list', { title: "All Items", item_list: results.item_list, categories: results.categories, item: item, errors: errors.array() })
            })
        } else {

            item.save(function(err) {
                if (err) return next(err);

                res.redirect('/items')
            })

        }
    }
]

// Display page to update Item
exports.item_update_get = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id)
                .populate('category')
                .exec(callback);
        },
        categories: function(callback) {
            Category.find({}).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        for (let i = 0; i < results.categories.length; i++) {
            for (let j = 0; j < results.item.category.length; j++) {
                if (results.item.category[j]._id.toString() === results.categories[i]._id.toString()) {
                    results.categories[i].selected = true;
                }
            }
        }

        res.render('item_update', { title: 'Edit Item', item: results.item, categories: results.categories, errors: '' });
    });
}

// Handle update POST
exports.item_update_post = [

    // Convert category into an array
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            if (typeof req.body.category === 'undefined') {
                req.body.category = [];
            } else {
                req.body.category = [req.body.category];
            }
        }
        next();
    },

    // Validate Input fields
    body('name', 'Name must not be empty').trim().isLength({ min: 2 }).escape(),
    body('description', "Description must not be empty").trim().isLength({ min: 2 }).escape(),
    body('price', "Price must not be less than $1").isNumeric({ min: 1 }).escape(),
    body('number_in_stock', "Number in stock must not be less than 1").isNumeric({ min: 1 }).escape(),
    body('category.*').escape(),

    // if validation fails, render index page
    (req, res, next) => {

        // Extract the validation errors
        errors = validationResult(req);

        // Create new Item
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            number_in_stock: req.body.number_in_stock,
            category: (typeof req.body.category === undefined) ? [] : req.body.category,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // Redirect
            async.parallel({
                item: function(callback) {
                    Item.findById(req.params.id)
                        .populate('category')
                        .exec(callback);
                },
                categories: function(callback) {
                    Category.find({}).exec(callback)
                }
            }, function(err, results) {
                if (err) return next(err);

                if (results.item == null) {
                    err = new Error('Item not found');
                    err.status = 404;
                    return next(err);
                }

                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].selected = true;
                    }
                }

                res.render('item_update', { title: "Edit Item", categories: results.categories, item: item, errors: errors.array() })
            })
        } else {

            Item.findByIdAndUpdate(req.params.id, item, {}, function(err, theitem) {
                if (err) return next(err);

                res.redirect('/items');
            });

        }
    }
]

//
exports.item_delete = function(req, res, next) {
    Item.findByIdAndRemove(req.params.id).exec(err => {
        if (err) return next(err);

        res.redirect('/items');
    });
}