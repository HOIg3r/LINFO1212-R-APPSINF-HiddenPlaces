// Import module
var express = require('express');
var app = express()


// Start the site
app.use(express.static('static'));
app.listen(8080);
