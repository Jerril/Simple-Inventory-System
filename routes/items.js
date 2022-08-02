const express = require('express');
const router = express.Router();
const item_controller = require('../controllers/itemController');

// GET request to display all items
router.get('/', item_controller.index);

// POST request to create new Item
router.post('/', item_controller.item_create_post);

// GET request to update Item
router.get('/:id/update', item_controller.item_update_get);

// POST request to update Item
router.post('/:id/update', item_controller.item_update_post);

// POST request to delete Item
router.post('/:id/delete', item_controller.item_delete);

module.exports = router;