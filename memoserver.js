
var express = require('express');
var app = express();

var request = require("request");
var fs = require('fs');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var mustache = require('mustache'); // bring in mustache template engine

var path = '/home/pi/pathtofile';
var pathMemo = '/home/pi/MagicMirror/modules/MMM-Memo/';

var demoData = [{ // dummy data to display
"memoTitle":"einkaufsliste","level":"INFO",
"item":"Brot","timestamp":"2018-01-29T19:23:45.619Z"},
{"memoTitle":"einkaufsliste","level":"INFO",
"item":"Obst","timestamp":"2018-01-29T19:30:55.311Z"},
{"memoTitle":"einkaufsliste","level":"INFO",
"item":"Zwiebel","timestamp":"2018-01-30T00:04:15.919Z"}
];

// define routes here..
app.get('/', function (req, res) {
    var rData = JSON.parse(fs.readFileSync(pathMemo + 'MMM-Memo.json', 'utf-8'));
    //var rData = {'memos':demoData}; // wrap the data in a global object... (mustache starts from an object then parses)
    var page = fs.readFileSync(path + 'index.html', "utf8"); // bring in the HTML file
    var html = mustache.to_html(page, rData); // replace all of the data
    console.log(rData);
    res.send(html); // send to client
    //res.sendFile(path + 'index.html');
});

app.get('/additem', function (req, res) {
    res.sendFile(path + 'additem.html');
});

app.get('/deleteitem', function (req, res) {
    var rData = JSON.parse(fs.readFileSync(pathMemo + 'MMM-Memo.json', 'utf-8'));
    rData.memos.sort((function (a, b) {
                              return new Date(b.timestamp) - new Date(a.timestamp)
                            }));
    console.log("sorted Data");

    for (i=0; i<rData.memos.length; i++) {
        rData.memos[i].itemnumber = i+1;
    }
    console.log(rData);
    //var rData = {'memos':demoData}; // wrap the data in a global object... (mustache starts from an object then parses)
    var page = fs.readFileSync(path + 'deleteitem.html', "utf8"); // bring in the HTML file
    var html = mustache.to_html(page, rData); // replace all of the data
    res.send(html);
});

app.post('/submit-additem', function (req, res) {
    res.redirect('/additem');
});

app.post('/submit-deleteitem', function (req, res) {
    res.redirect('/deleteitem');
});

app.post('/submit-additem-data', function (req, res) {
    var item = req.body.AddItem ;
    request('http://localhost:8080/AddMemo?memoTitle=einkaufsliste&item='+item+'&level=INFO', function (err, resp, body) {
        console.log("error ", err);
        console.log("statuscode ", resp);
        console.log("body ", body);
    });

    res.send('<html><body><p>' + item + ' Submitted Successfully!</p><a href="http://10.123.123.14:8888">home</a></body></html>');
});

app.post('/submit-deleteitem-data', function (req, res) {
    var itemnumber = req.body.DeleteItem ;
    // console.log("itemnumber");
    // console.log(itemnumber);
    if (itemnumber instanceof Array) {
        for (i=0; i<itemnumber.length; i++) {
            DeleteREST(itemnumber[i]);
        }
    } else {
        DeleteREST(itemnumber);
    }
    function DeleteREST (number) {
      request('http://localhost:8080/RemoveMemo?memoTitle=einkaufsliste&item=' + number, function (err, resp, body) {
        console.log("error ", err);
        //console.log("statuscode ", resp);
        console.log("body ", body);
      });
    }
    console.log(req.body);
    res.send('<html><body><p>' + itemnumber + ' Deleted Successfully!</p><a href="http://10.123.123.14:8888">home</a></body></html>');
});

app.put('/update-data', function (req, res) {
    res.send('PUT Request');
});

app.delete('/delete-data', function (req, res) {
    res.send('DELETE Request');
});

var server = app.listen(8888, function () {
    console.log('Node server is running..');
});
