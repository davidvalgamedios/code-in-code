const express  = require('express');
const app      = express();
const port = 8003;
var http = require('http');
var bodyParser   = require('body-parser');

const env = process.argv[2]=='-prod'?'prod':'dev';

var server = http.createServer(app);

/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VirtualPingPong');*/


// routes ======================================================================
app.set('view engine', 'ejs');
app.use("/dist", express.static(__dirname + '/dist'));
app.use(bodyParser()); // get information from html forms

app.use("/node_modules", express.static(__dirname + '/node_modules'));
app.use("/build", express.static(__dirname + '/build'));


app.get('/', function(req, res) {
    res.render('index.ejs', {
        env: env
    });
});

server.listen(port);
console.log("Listening on: "+port);