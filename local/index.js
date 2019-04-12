var express = require('express');
var path = require('path');
var app = express();

var PORT = 3000

app.get('/local/compiled.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/../lib/compiled.js'));
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(PORT)
