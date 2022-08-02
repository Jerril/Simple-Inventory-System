const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Item = require('../models/item');
const Category = require('../models/category');

// Display list of categorys
exports.index = function(req, res, next) {
    async.parallel({
        categories: function(callback) {
            Category.find({}).exec(callback);
        },
    }, function(err, results) {
        if (err) return next(err);

        res.render('category_list', { title: "All Categories", category_list: results.categories, category: '', errors: '' });
    })
}

// Create new category
exports.category_create_post = [
    // Validate Input fields
    body('name', 'Name must not be empty').trim().isLength({ min: 2 }).escape(),
    body('description', "Description must not be empty").trim().isLength({ min: 2 }).escape(),

    // if validation fails, render index page
    (req, res, next) => {

        // Extract the validation errors
        errors = validationResult(req);

        // Create new category
        const category = new Category({
            name: req.body.name,
            description: req.body.description
        });

        if (!errors.isEmpty()) {
            // Redirect
            async.parallel({
                category_list: function(callback) {
                    Category.find({})
                        .sort({ _id: -1 })
                        .exec(callback)
                }
            }, function(err, results) {
                if (err) return next(err);

                res.render('category_list', { title: "All Categories", category_list: results.category_list, category: category, errors: errors.array() })
            })
        } else {
            category.save(function(err) {
                if (err) return next(err);

                res.redirect('/category')
            })

        }
    }
]

// Display page to update category
exports.category_update_get = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
                .exec(callback);
        },
    }, function(err, results) {
        if (err) return next(err);

        res.render('category_update', { title: 'Edit Category', category: results.category, errors: '' });
    });
}

// Handle update POST
exports.category_update_post = [
    // Validate Input fields
    body('name', 'Name must not be empty').trim().isLength({ min: 2 }).escape(),
    body('description', "Description must not be empty").trim().isLength({ min: 2 }).escape(),

    // if validation fails, render index page
    (req, res, next) => {

        // Extract the validation errors
        errors = validationResult(req);

        // Create new category
        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // Redirect
            async.parallel({
                category: function(callback) {
                    Category.findById(req.params.id)
                        .exec(callback);
                },
            }, function(err, results) {
                if (err) return next(err);

                if (results.category == null) {
                    err = new Error('Category not found');
                    err.status = 404;
                    return next(err);
                }

                res.render('category_update', { title: "Edit Category", category: category, errors: errors.array() })
            })
        } else {

            Category.findByIdAndUpdate(req.params.id, category, {}, function(err, thecategory) {
                if (err) return next(err);

                res.redirect('/category');
            });

        }
    }
]

//
exports.category_delete_post = function(req, res, next) {
    async.parallel({
        category_list: function(callback) {
            Category.find({}).exec(callback);
        },
        category: function(callback) {
            Category.findById('62e8bd77fd9120f3e0c3a288').exec(callback);
        },
        item: function(callback) {
            // Get all the items
            // check if the req.params.id appears in each item category
            // Item.findOne({ 'category': { $elemMatch: { name: "Others" } } }).exec(callback);
            // Item.find({ category: { $elemMatch: { name: "Others" } } }).exec(callback);
            // Item.findOne({ 'category': { $elemMatch: { _id: mongoose.Types.ObjectId(req.params.id) } } }).exec(callback);
            Item.find({}).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        if (results.category === null) {
            err = new Error("Category not found");
            err.status = 404;
            return next(err);
        }

        // check if this category is used in any item
        let itemExists = false;

        results.item.forEach((el, i) => {
            if (el.category.includes(req.params.id)) {
                itemExists = true;
                return;
            }
        });

        if (itemExists) {
            const errors = [];
            errors[0] = "You have to delete all the items attached to this category before you can delete the category";
            res.render('category_list', { title: "All Categories", category_list: results.category_list, category: '', errors: errors })
            return;
        }

        Category.findByIdAndRemove(req.params.id, function deleteCategory(err) {
            if (err) return next(err);

            res.redirect('/category');
        });
    })
}