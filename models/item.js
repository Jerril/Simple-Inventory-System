const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true, minLength: 1 },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    number_in_stock: { type: Number, required: true, min: 0 },
    category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }]
});

ItemSchema.virtual('url').get(function() {
    return '/items/' + this._id;
});

module.exports = mongoose.model('Item', ItemSchema);