// Filename app.js

var BOX_API_KEY = '';
var PORT = 8080;
var MONGODB_ADDRESS = 'mongodb://127.0.0.1:27017/test';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cors = require('cors');
var mongoose = require('mongoose');

var app = express();
app.listen(PORT);
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(MONGODB_ADDRESS);

var StoryModel = mongoose.model('Stories', {
  title: String,
  documentId: String
});

app.post('/api/addcontent', function(req, res) {
  var options = {
    url: 'https://view-api.box.com/1/documents',
    method: 'POST',
    headers: {
      'Authorization': 'Token '+BOX_API_KEY
    },
    json: {
      url: req.body.url
    }
  };

  request(options, function(error, response, body) {
    if(response.statusCode != 202) {
      res.send({error: 'Unable to add content'});
      console.log(response);
      return;
    }

    StoryModel.create({title: req.body.title, documentId: body.id}, function(error, doc) {
      if(error) {
        res.send({error: 'Unable to add content'});
        return;
      }

      res.send({documentId: body.id});
    });
  });
});

app.get('/api/getstories', function(req, res) {
  StoryModel.find({}, function(error, stories) {
    var results = [];

    for(var i in stories) {
      results.push({
        title: stories[i].title, 
        documentId: stories[i].documentId
      });
    }

    res.send(results);
  });
});

app.post('/api/getsession', function(req, res) {
  var options = {
    url: 'https://view-api.box.com/1/sessions',
    method: 'POST',
    headers: {
      'Authorization': 'Token '+BOX_API_KEY
    },
    json: {
      document_id: req.body.documentId
    }
  };

  request(options, function(error, response, body) {
    if(response.statusCode != 201) {
      res.send({error: 'Unable to get session'});
      return;
    }

    res.send({sessionId: body.id});
  });
});

app.use(express.static(__dirname + '/public'));

console.log('App listening on port '+PORT);