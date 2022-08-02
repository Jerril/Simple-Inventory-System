const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const indexRouter = require('./routes/index');
const itemsRouter = require('./routes/items');
const categoryRouter = require('./routes/category');

// Set up bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = 'mongodb+srv://inventory-app:inventory-app@cluster0.1rsm1.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serving static files
app.use(express.static('public'));

// routes
app.use('/', indexRouter)
app.use('/items', itemsRouter);
app.use('/category', categoryRouter);

app.listen(port, function() {
    console.log(`App running at http://127.0.0.1:${port}/`);
});