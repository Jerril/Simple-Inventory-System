const express = require('express');
const router = express.Router();
const category_controller = require('../controllers/categoryController');

// List all categories
router.get('/', category_controller.index);

// Create new category - POST
router.post('/', category_controller.category_create_post);

// Update category - GET
router.get('/:id/update', category_controller.category_update_get);

// Update category - POST
router.post('/:id/update', category_controller.category_update_post);

// Delete Category - POST
router.post('/:id/delete', category_controller.category_delete_post);

module.exports = router;